const express = require("express");
const router = express.Router();

const postController = require("../controller/post");
const middleware = require("../middleware/is-auth");

router.post("/create", middleware.authMiddleware, postController.createPost);

router.get(
  "/explore",
  middleware.optionalAuthMiddleware,
  postController.fetchPublicPosts
);

router.get(
  "/following-feed",
  middleware.authMiddleware,
  postController.fetchPostsByFollowing
);

router.get("/user-posts/:userName", postController.fetchUserPosts);

router.get(
  "/:postId",
  middleware.optionalAuthMiddleware,
  postController.fetchPostById
);

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

router.get("/:postId/comment", postController.fetchComments);

router.delete(
  "/:postId/delete",
  middleware.authMiddleware,
  postController.deletePost
);

router.put("/:postId/edit", middleware.authMiddleware, postController.editPost);

module.exports = router;
