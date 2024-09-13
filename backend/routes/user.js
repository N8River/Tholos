const express = require("express");

const router = express.Router();

const userController = require("../controller/user");
const middleware = require("../middleware/is-auth");

// router.get("/profile", middleware.authMiddleware, userController.fetchUserInfo);
// router.get("/profile", userController.fetchUserInfo);

router.get("/:userId", userController.fetchUserProfileByUserId);

router.put(
  "/profile/edit-profile",
  middleware.authMiddleware,
  userController.updateProfileInfo
);

router.get("/profile/:username", userController.fetchUserProfileByUsername);

router.get("/search", middleware.authMiddleware, userController.searchUsers);

router.post(
  "/:userId/follow",
  middleware.authMiddleware,
  userController.followUser
);

router.post(
  "/:userId/unfollow",
  middleware.authMiddleware,
  userController.unfollowUser
);

router.get(
  "/:userId/is-following",
  middleware.authMiddleware,
  userController.isFollowing
);

module.exports = router;
