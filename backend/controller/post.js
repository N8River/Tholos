const Post = require("../model/post");
const User = require("../model/user");

const Notification = require("../model/notification");

exports.createPost = async (req, res, next) => {
  try {
    const { content, image } = req.body;

    if (!content && !image) {
      return res
        .status(400)
        .json({ message: "Post must have either content or an image" });
    }

    const userId = req.user.userId;

    const newPost = new Post({
      user: userId,
      content,
      image,
    });

    const savedPost = await newPost.save();

    res
      .status(201)
      .json({ message: "Post created successfully", post: savedPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res
      .status(500)
      .json({ message: "Failed to create post", error: error.message });
  }
};

exports.fetchPublicPosts = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.userId;

    const publicPosts = await Post.find({ user: { $ne: loggedInUserId } })
      .populate({
        path: "user",
        match: { profileVisibility: "Public" },
      })
      .sort({ createdAt: -1 });

    const filteredPosts = publicPosts.filter((post) => post.user !== null);

    res.status(200).json(filteredPosts);
  } catch (error) {
    console.error("Error fetching public posts:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch public posts", error: error.message });
  }
};

exports.fetchPostsByFollowing = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("following");

    // Fetch posts from the people the user follows
    const posts = await Post.find({ user: { $in: user.following } }).sort({
      createdAt: -1,
    }); // Sort by newest first

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts by following:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch posts", error: error.message });
  }
};

exports.fetchUserPosts = async (req, res, next) => {
  try {
    const { userName } = req.params;
    console.log("🔴 userName", userName);
    // const currentUserId = req.user.userId;

    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If profile is private, check if the current user is following
    // if (user.profileVisibility === "Private") {
    //   const isFollowing = user.followers.includes(currentUserId);
    //   if (!isFollowing) {
    //     return res.status(403).json({ message: "This account is private." });
    //   }
    // }

    const userPosts = await Post.find({ user: user._id })
      .populate("user", "userName avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(userPosts);
  } catch (error) {
    console.error("Error fetching posts by the user:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch user's posts", error: error.message });
  }
};

exports.fetchPostById = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate(
      "user",
      "userName avatar"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch post", error: error.message });
  }
};

// exports.addComment = async (req, res, next) => {
exports.toggleLike = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    // console.log("🔴 userId", userId);

    const user = await User.findOne({ _id: userId });
    // console.log("🔴 user", user);

    const postId = req.body.postId;
    // console.log(postId);

    const post = await Post.findOne({ _id: postId });
    // console.log("🔴", post);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      post.likes = post.likes.filter((like) => like.toString() !== userId);
    } else {
      post.likes.push(userId);

      // Create a notification for the post owner
      const notification = new Notification({
        user: post.user, // Post owner
        sender: user,
        type: "like",
        message: `User ${user.userName} liked your post.`,
        post: postId, // Optionally link the post
      });

      await notification.save();

      // Emits a real-time notification to the post owner
      const io = req.app.locals.io;
      io.to(post.user.toString()).emit("notification", notification);
    }

    await post.save();

    res.status(200).json({
      message: hasLiked ? "Post unliked" : "Post liked",
      likes: post.likes.length,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res
      .status(500)
      .json({ message: "Failed to toggle like", error: error.message });
  }
};
//   try {
//     const userId = req.user.userId;

//     const user = await User.findById(userId);

//     const { postId } = req.params;
//     const { comment } = req.body;
//     // console.log("🔴 postId", comment);
//     const post = await Post.findById(postId);
//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     post.comments.push({
//       user: user._id,
//       text: comment,
//     });

//     await post.save();

//     const populatedPost = await Post.findById(postId)
//       .populate("user") // Populate post's user
//       .populate("comments.user");

//     res.status(200).json({
//       message: "Comment added successfully",
//       comment: populatedPost.comments[populatedPost.comments.length - 1],
//     });
//   } catch (error) {
//     console.error("Error commenting:", error);
//     res
//       .status(500)
//       .json({ message: "Failed to comment", error: error.message });
//   }
// };

exports.addComment = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findOne({ _id: userId });

    const { postId } = req.params;
    const { comment } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: userId,
      text: comment,
    });

    await post.save();

    const populatedPost = await Post.findById(postId).populate("comments.user");

    // Create a notification for the post owner
    const notification = new Notification({
      user: post.user, // Post owner
      type: "comment",
      sender: user,
      message: `User ${user.userName} commented on your post.`,
      post: postId,
    });

    await notification.save();

    // Emit a real-time notification to the post owner
    const io = req.app.locals.io;
    io.to(post.user.toString()).emit("notification", notification);

    res.status(200).json({
      message: "Comment added successfully",
      comment: populatedPost.comments[populatedPost.comments.length - 1],
    });
  } catch (error) {
    console.error("Error commenting:", error);
    res
      .status(500)
      .json({ message: "Failed to comment", error: error.message });
  }
};

exports.fetchComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    // Find the post and populate comments
    const post = await Post.findById(postId).select("comments").populate({
      path: "comments.user",
      select: "userName avatar",
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ comments: post.comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch comments", error: error.message });
  }
};
