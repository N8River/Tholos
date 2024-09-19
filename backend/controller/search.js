const User = require("../model/user");
const Post = require("../model/post");

exports.search = async (req, res, next) => {
  const { query, currentUserId } = req.query;

  try {
    // Search for users
    let usersQuery = {
      $or: [
        { fullName: { $regex: query, $options: "i" } },
        { userName: { $regex: query, $options: "i" } },
      ],
    };

    if (currentUserId) {
      usersQuery._id = { $ne: currentUserId };
    }

    const users = await User.find(usersQuery).select(
      "userName avatar fullName bio"
    );

    // Search for posts
    let postsQuery = { content: { $regex: query, $options: "i" } };

    let posts;
    if (currentUserId) {
      const user = await User.findById(currentUserId).populate("following");
      const followingIds = user.following.map((f) => f._id);

      // Find posts by users with 'Public' profileVisibility or private posts by followed users
      posts = await Post.find(postsQuery).populate({
        path: "user",
        select: "userName avatar profileVisibility",
        match: {
          $or: [
            { profileVisibility: "Public" },
            { _id: { $in: followingIds }, profileVisibility: "Private" },
          ],
        },
      });
    } else {
      // Only public posts for non-logged-in users
      posts = await Post.find(postsQuery).populate({
        path: "user",
        select: "userName avatar profileVisibility",
        match: { profileVisibility: "Public" },
      });
    }

    // Filter out posts that didn't match the population criteria
    posts = posts.filter((post) => post.user !== null);

    res.status(200).json({ users, posts });
  } catch (error) {
    console.error("Error performing search:", error);
    res.status(500).json({ error: "Error performing search" });
  }
};
