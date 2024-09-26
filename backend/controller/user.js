const User = require("../model/user");
const Notification = require("../model/notification");

exports.fetchUserInfo = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    console.log(userId);

    const user = await User.findById(userId, "-password");
    console.log(user);

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
    console.log("🔴 user", user);

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

    res.status(200).json(user);
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
  console.log("🔴 userId:", userId);

  const currentUserId = req.user.userId; // logged-in user's id
  const user = await User.findOne({ _id: currentUserId });

  console.log("🔴 currentUserId:", currentUserId);

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
        message: `User ${user.userName} requested to follow you.`,
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
      message: `User ${user.userName} started following you.`,
    });

    await notification.save();
    io.to(userId.toString()).emit("notification", notification);

    res.status(200).json({ message: "Followed user successfully" });
  } catch (error) {
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

  // console.log("🔴 userId", userId);
  // console.log("🔴 currentUserId", currentUserId);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = user.followers.includes(currentUserId);
    const followRequestPending = user.followRequests.includes(currentUserId);
    // console.log("🔴 isFollowing", isFollowing);
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
      message: `${user.userName} accepted your follow request.`,
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
