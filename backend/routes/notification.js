const express = require("express");
const router = express.Router();

const notificationController = require("../controller/notification");
const middleware = require("../middleware/is-auth");

router.get(
  "/unread",
  middleware.authMiddleware,
  notificationController.unreadNotification
);

router.patch(
  "/mark-as-read/:id",
  middleware.authMiddleware,
  notificationController.markAsRead
);
module.exports = router;
