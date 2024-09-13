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

  const currentUserId = req.user.userId; // Get logged-in user's id
  const user = await User.findOne({ _id: currentUserId });

  // console.log("userId:", userId);
  // console.log("currentUserId:", currentUserId);

  try {
    // Find the target user to follow
    const userToFollow = await User.findById(userId);
    if (!userToFollow) return res.status(404).json({ error: "User not found" });

    // Update the current user's following list and the target user's followers list
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $addToSet: { followers: currentUserId },
    });

    const notification = new Notification({
      user: userId, // The user being followed (who will receive the notification)
      type: "follow",
      sender: user,
      message: `User ${user.userName} started following you.`,
    });

    await notification.save();

    // Emit a real-time notification to the followed user
    const io = req.app.locals.io; // Access the socket.io instance
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
    // console.log("🔴 isFollowing", isFollowing);
    res.status(200).json({ isFollowing });
  } catch (error) {
    res.status(500).json({ error: "Error checking follow status" });
  }
};
