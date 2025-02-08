const express = require("express");

const router = express.Router();

const userController = require("../controller/user");
const middleware = require("../middleware/is-auth");
const validator = require("../middleware/validator");

router.get(
  "/following",
  middleware.authMiddleware,
  userController.fetchFollowing
);

router.get(
  "/follow-suggestions",
  middleware.authMiddleware,
  userController.suggestUsers
);

router.get(
  "/:userId",
  validator.objectIdValidator("userId", "param"),
  validator.handleValidationErrors,
  userController.fetchUserProfileByUserId
);

router.put(
  "/profile/edit-profile",
  middleware.authMiddleware,
  validator.updateProfileValidator,
  validator.handleValidationErrors,
  userController.updateProfileInfo
);

router.get(
  "/profile/:username",
  validator.usernameValidator,
  validator.handleValidationErrors,
  userController.fetchUserProfileByUsername
);

router.get(
  "/profile/:username/mutual-followers",
  middleware.authMiddleware,
  validator.usernameValidator,
  validator.handleValidationErrors,
  userController.getMutualFollowers
);

router.get("/search", middleware.authMiddleware, userController.searchUsers);

router.post(
  "/:userId/follow",
  middleware.authMiddleware,
  validator.objectIdValidator("userId", "param"),
  validator.handleValidationErrors,
  userController.followUser
);

router.post(
  "/:userId/unfollow",
  middleware.authMiddleware,
  validator.objectIdValidator("userId", "param"),
  validator.handleValidationErrors,
  userController.unfollowUser
);

router.get(
  "/:userId/is-following",
  middleware.authMiddleware,
  validator.objectIdValidator("userId", "param"),
  validator.handleValidationErrors,
  userController.isFollowing
);

router.post(
  "/:userId/approve-follow-request",
  middleware.authMiddleware,
  validator.objectIdValidator("userId", "param"),
  validator.handleValidationErrors,
  userController.approveFollowRequest
);

router.post(
  "/:userId/reject-follow-request",
  middleware.authMiddleware,
  validator.objectIdValidator("userId", "param"),
  validator.handleValidationErrors,
  userController.rejectFollowRequest
);

router.get(
  "/:userId/followers",
  middleware.authMiddleware,
  userController.getFollowers
);

router.get(
  "/:userId/following",
  middleware.authMiddleware,
  userController.getFollowing
);

router.get(
  "/current-user",
  middleware.authMiddleware,
  userController.getCurrentUser
);


module.exports = router;
