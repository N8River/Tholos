const Post = require("../model/post");
const User = require("../model/user");

const Notification = require("../model/notification");

exports.createPost = async (req, res, next) => {
  try {
    const { content, images } = req.body; // Accept images array from the request

    if (!content && (!images || images.length === 0)) {
      return res.status(400).json({
        message: "Post must have either content or at least one image",
      });
    }

    const userId = req.user.userId;

    const newPost = new Post({
      user: userId,
      content,
      images, // Store the array of image URLs
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
    const loggedInUserId = req.user ? req.user.userId : null;

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = loggedInUserId ? { user: { $ne: loggedInUserId } } : {};

    const publicPosts = await Post.find(query)
      .populate({
        path: "user",
        match: { profileVisibility: "Public" },
        select: "userName avatar fullName bio", // only these fields will be included
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId).select("following");

    // Fetch posts from the people the user follows
    const posts = await Post.find({ user: { $in: user.following } })
      .populate({
        path: "user",
        select: "userName avatar fullName bio", // only include these fields
      })
      .sort({ createdAt: -1 })
      .skip(skip) // Skip documents for pagination
      .limit(limit); // Limit the number of posts

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
    const isOwner = req.query.isOwner === "true";
    const { currentUserId } = req.query;

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (isOwner) {
      const userPosts = await Post.find({ user: user._id })
        .populate("user", "userName avatar")
        .sort({ createdAt: -1, _id: -1 }) // Secondary sort by _id to guarantee stability
        .skip(skip) // Skip documents for pagination
        .limit(limit); // Limit the number of posts

      return res.status(200).json(userPosts);
    }

    if (user.profileVisibility === "Private") {
      const isFollowing = user.followers.some(
        (followerId) => followerId.toString() === currentUserId
      );

      if (!isFollowing) {
        // Instead of returning a 403 error, return a successful response with a flag.
        return res.status(200).json({ isPrivate: true, posts: [] });
      }
    }

    const userPosts = await Post.find({ user: user._id })
      .populate("user", "userName avatar")
      .sort({ createdAt: -1, _id: -1 }) // Secondary sort by _id to guarantee stability
      .skip(skip) // Skip documents for pagination
      .limit(limit); // Limit the number of posts

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
    const loggedInUserId = req.user?.userId; // Get the logged-in user ID if authenticated

    const post = await Post.findById(postId).populate(
      "user",
      "userName avatar"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const postOwner = await User.findById(post.user._id);

    // Check if the logged-in user is the owner of the post
    const isOwner = postOwner._id.toString() === loggedInUserId;

    if (postOwner.profileVisibility === "Private") {
      // If the user is not the owner and not following
      if (
        !isOwner &&
        (!loggedInUserId || !postOwner.followers.includes(loggedInUserId))
      ) {
        return res.status(403).json({ message: "This post is private." });
      }
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch post", error: error.message });
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findOne({ _id: userId });

    const postId = req.body.postId;

    const post = await Post.findOne({ _id: postId });

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
        message: `liked your post.`,
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
      message: `commented on your post.`,
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

exports.deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const postToDelete = await Post.findOneAndDelete({
      _id: postId,
      user: userId,
    });

    if (!postToDelete) {
      return res.status(404).json({
        message: "Post not found or you're not authorized to delete this post",
      });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.editPost = async (req, res, next) => {
  const { postId } = req.params;
  const { content } = req.body;

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { content },
      { new: true } // Returns the updated document
    );

    if (!updatedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    res
      .status(200)
      .json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Error updating post" });
  }
};
