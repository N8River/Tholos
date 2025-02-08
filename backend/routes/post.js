const express = require("express");
const router = express.Router();

const postController = require("../controller/post");
const middleware = require("../middleware/is-auth");
const validator = require("../middleware/validator");

router.post(
  "/create",
  middleware.authMiddleware,
  validator.createPostValidator,
  validator.handleValidationErrors,
  postController.createPost
);

router.get(
  "/explore",
  middleware.optionalAuthMiddleware,
  validator.validatePagination,
  validator.handleValidationErrors,
  postController.fetchPublicPosts
);

router.get(
  "/following-feed",
  middleware.authMiddleware,
  validator.validatePagination,
  validator.handleValidationErrors,
  postController.fetchPostsByFollowing
);

router.get(
  "/user-posts/:userName",
  validator.validateUserPosts,
  validator.handleValidationErrors,
  postController.fetchUserPosts
);

router.get(
  "/:postId",
  middleware.optionalAuthMiddleware,
  validator.objectIdValidator("postId", "param"),
  validator.handleValidationErrors,
  postController.fetchPostById
);

router.post(
  "/:postId/like",
  middleware.authMiddleware,
  validator.objectIdValidator("postId", "param"),
  validator.handleValidationErrors,
  postController.toggleLike
);

router.post(
  "/:postId/comment",
  middleware.authMiddleware,
  validator.objectIdValidator("postId", "param"),
  validator.commentValidator,
  validator.handleValidationErrors,
  postController.addComment
);

router.get(
  "/:postId/comment",
  validator.objectIdValidator("postId", "param"),
  validator.handleValidationErrors,
  postController.fetchComments
);

router.delete(
  "/:postId/delete",
  middleware.authMiddleware,
  validator.objectIdValidator("postId", "param"),
  validator.handleValidationErrors,
  postController.deletePost
);

router.put(
  "/:postId/edit",
  middleware.authMiddleware,
  validator.objectIdValidator("postId", "param"),
  validator.handleValidationErrors,
  postController.editPost
);

module.exports = router;
