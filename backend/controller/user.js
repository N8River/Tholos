const User = require("../model/user");
const Notification = require("../model/notification");
const Post = require("../model/post");

exports.fetchUserInfo = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId, "-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error fetching User Info:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch User Info", error: error.message });
  }
};

exports.fetchUserProfileByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId }, "-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch user profile", error: error.message });
  }
};

exports.fetchUserProfileByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ userName: username }, "-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the count of posts the user has
    const postCount = await Post.countDocuments({ user: user._id });

    res.status(200).json({ user, postCount });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch user profile", error: error.message });
  }
};

exports.updateProfileInfo = async (req, res, next) => {
  try {
    const { fullName, userName, avatar, bio, visibility } = req.body;
    const userId = req.user.userId;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        userName,
        avatar,
        bio,
        profileVisibility: visibility,
      },
      { new: true, runValidators: true } // `new: true` returns the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res
      .status(500)
      .json({ message: "Failed to update user profile", error: error.message });
  }
};

exports.searchUsers = async (req, res, next) => {
  try {
    const query = req.query.query;
    const users = await User.find({
      userName: { $regex: query, $options: "i" }, // Case-insensitive search
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Failed to search users" });
  }
};

exports.followUser = async (req, res, next) => {
  const { userId } = req.params;

  const currentUserId = req.user.userId; // logged-in user's id

  try {
    const user = await User.findOne({ _id: currentUserId });
    const userToFollow = await User.findById(userId);

    if (!userToFollow) return res.status(404).json({ error: "User not found" });

    // If profile is private, send a follow request instead
    if (userToFollow.profileVisibility === "Private") {
      // Check if a follow request is already sent
      if (userToFollow.followRequests.includes(currentUserId)) {
        return res.status(400).json({ error: "Follow request already sent" });
      }

      // Add follow request to the user's profile
      await User.findByIdAndUpdate(userId, {
        $addToSet: { followRequests: currentUserId },
      });

      const notification = new Notification({
        user: userId, // The user being requested to follow
        type: "follow-request",
        sender: user,
        message: `requested to follow you.`,
      });

      await notification.save();

      const io = req.app.locals.io;
      io.to(userId.toString()).emit("notification", notification);

      return res
        .status(200)
        .json({ message: "Follow request sent successfully" });
    }

    // If profile is public, follow the user directly
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $addToSet: { followers: currentUserId },
    });

    const notification = new Notification({
      user: userId, // The user being followed
      type: "follow",
      sender: user,
      message: `started following you.`,
    });

    await notification.save();
    const io = req.app.locals.io;
    io.to(userId.toString()).emit("notification", notification);

    console.log("FOLLOW SUCCESSFULL");

    res.status(200).json({ message: "Followed user successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error following user" });
  }
};

exports.unfollowUser = async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user.userId;

  try {
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $pull: { followers: currentUserId },
    });

    res.status(200).json({ message: "Unfollowed user successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error unfollowing user" });
  }
};

exports.isFollowing = async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = user.followers.includes(currentUserId);
    const followRequestPending = user.followRequests.includes(currentUserId);

    res.status(200).json({ isFollowing, followRequestPending });
  } catch (error) {
    res.status(500).json({ error: "Error checking follow status" });
  }
};

exports.approveFollowRequest = async (req, res, next) => {
  const { userId } = req.params; // The user who sent the follow request
  const currentUserId = req.user.userId; // The owner of the profile

  try {
    const user = await User.findById(currentUserId);

    if (!user.followRequests.includes(userId)) {
      return res
        .status(400)
        .json({ error: "No follow request from this user" });
    }

    // Remove from followRequests and add to followers
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { followRequests: userId },
      $addToSet: { followers: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $addToSet: { following: currentUserId },
    });

    // Mark the follow request notification as read
    await Notification.updateMany(
      { user: currentUserId, sender: userId, type: "follow-request" },
      { isRead: true }
    );

    // Notify the requester that the follow request was accepted
    const notification = new Notification({
      user: userId, // The user who requested to follow
      type: "follow-accept",
      sender: user,
      message: `accepted your follow request.`,
    });

    await notification.save();
    const io = req.app.locals.io;
    io.to(userId.toString()).emit("notification", notification);

    res.status(200).json({ message: "Follow request approved" });
  } catch (error) {
    res.status(500).json({ error: "Error approving follow request" });
  }
};

exports.rejectFollowRequest = async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user.userId;

  try {
    const user = await User.findById(currentUserId);

    if (!user.followRequests.includes(userId)) {
      return res
        .status(400)
        .json({ error: "No follow request from this user" });
    }

    // Remove from followRequests
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { followRequests: userId },
    });

    // Mark the follow request notification as read
    await Notification.updateMany(
      { user: currentUserId, sender: userId, type: "follow-request" },
      { isRead: true }
    );

    res.status(200).json({ message: "Follow request rejected" });
  } catch (error) {
    res.status(500).json({ error: "Error rejecting follow request" });
  }
};

exports.fetchFollowing = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).populate({
      path: "following",
      select: "userName fullName avatar",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ following: user.following });
  } catch (error) {
    console.error("Error fetching following users:", error);
    res.status(500).json({ message: "Failed to fetch following users" });
  }
};

exports.suggestUsers = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { numberOfSuggestions } = req.query;

    const user = await User.findById(userId).select("following");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const suggestedUsers = await User.aggregate([
      {
        $match: {
          _id: { $ne: user._id, $nin: user.following }, // Exclude the current user and already followed users
          profileVisibility: { $ne: "Private" }, // Exclude private profiles
        },
      },
      { $sample: { size: +numberOfSuggestions } }, // Randomly select 5 users
      { $project: { userName: 1, fullName: 1, avatar: 1 } },
    ]);

    res.status(200).json({ suggestions: suggestedUsers });
  } catch (error) {
    console.error("Error fetching user suggestions:", error);
    res.status(500).json({ message: "Failed to fetch user suggestions" });
  }
};

exports.getMutualFollowers = async (req, res, next) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.userId;

    // Fetch the user profile
    const user = await User.findOne({ userName: username }).populate(
      "followers following",
      "userName fullName avatar"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let mutualFollowers = [];

    if (currentUserId) {
      const currentUser = await User.findById(currentUserId);

      // Find mutual followers
      mutualFollowers = user.followers.filter((followerId) =>
        currentUser.following.includes(followerId._id)
      );

      // Limit the number of mutual followers returned (e.g., 3)
      // mutualFollowers = mutualFollowers.slice(0, 3);
    }

    return res.status(200).json({ mutualFollowers });
  } catch (error) {
    console.error("Error fetching mutual followers:", error);
    res.status(500).json({ message: "Failed to fetch mutual followers" });
  }
};

// Fetch the list of followers with detailed user information
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    const maxMutuals = parseInt(req.query.maxMutuals);
    const maxOtherFollowers = parseInt(req.query.maxOtherFollowers);

    // Find the user and populate followers with the required fields
    const user = await User.findById(userId)
      .populate("followers", "userName fullName avatar")
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current user follows these users
    const currentUser = await User.findById(currentUserId);

    // Find mutual followers
    const mutualFollowers = user.followers
      .filter((follower) => currentUser.following.includes(follower._id))
      .slice(0, maxMutuals); // Limit mutual followers

    // Filter out mutual followers and the logged-in user from the other followers
    const otherFollowers = user.followers
      .filter(
        (follower) =>
          !currentUser.following.includes(follower._id) && // Not mutuals
          follower._id.toString() !== currentUserId // Not the logged-in user
      )
      .slice(0, maxOtherFollowers); // Limit other followers

    const followers = [
      ...mutualFollowers.map((follower) => ({
        ...follower._doc,
        isMutual: true,
        isFollowing: currentUser.following.includes(follower._id),
      })),
      ...otherFollowers.map((follower) => ({
        ...follower._doc,
        isMutual: false,
        isFollowing: currentUser.following.includes(follower._id),
      })),
    ];

    res.status(200).json(followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ message: "Failed to fetch followers" });
  }
};

// Fetch the list of following with detailed user information
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    const maxMutuals = parseInt(req.query.maxMutuals);
    const maxOtherFollowing = parseInt(req.query.maxOtherFollowing);

    // Find the user and populate following with the required fields
    const user = await User.findById(userId)
      .populate("following", "userName fullName avatar")
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current user follows these users
    const currentUser = await User.findById(currentUserId);

    // Find mutual following
    const mutualFollowing = user.following
      .filter((followingUser) =>
        currentUser.following.includes(followingUser._id)
      )
      .slice(0, maxMutuals); // Limit mutual following

    // Filter out mutuals and the logged-in user from the other following
    const otherFollowing = user.following
      .filter(
        (followingUser) =>
          !currentUser.following.includes(followingUser._id) && // Not mutuals
          followingUser._id.toString() !== currentUserId // Not the logged-in user
      )
      .slice(0, maxOtherFollowing); // Limit other following

    const following = [
      ...mutualFollowing.map((followingUser) => ({
        ...followingUser._doc,
        isMutual: true,
        isFollowing: currentUser.following.includes(followingUser._id),
      })),
      ...otherFollowing.map((followingUser) => ({
        ...followingUser._doc,
        isMutual: false,
        isFollowing: currentUser.following.includes(followingUser._id),
      })),
    ];

    res.status(200).json(following);
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ message: "Failed to fetch following" });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const { userId } = req.user; // Extracted from verified token
    const user = await User.findById(userId).select("userName email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch user info", error: error.message });
  }
};
