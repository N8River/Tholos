const express = require("express");
const router = express.Router();

const postController = require("../controller/post");
const middleware = require("../middleware/is-auth");

router.post("/create", middleware.authMiddleware, postController.createPost);

router.get(
  "/discover",
  middleware.authMiddleware,
  postController.fetchPublicPosts
);

router.get(
  "/feed",
  middleware.authMiddleware,
  postController.fetchPostsByFollowing
);

router.get("/user-posts/:userName", postController.fetchUserPosts);

router.get("/:postId", postController.fetchPostById);

router.post(
  "/:postId/like",
  middleware.authMiddleware,
  postController.toggleLike
);

router.post(
  "/:postId/comment",
  middleware.authMiddleware,
  postController.addComment
);

router.get(
  "/:postId/comment",
  middleware.authMiddleware,
  postController.fetchComments
);

module.exports = router;
