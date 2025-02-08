const express = require("express");
const router = express.Router();

const notificationController = require("../controller/notification");
const middleware = require("../middleware/is-auth");
const validator = require("../middleware/validator");

router.get(
  "/unread",
  middleware.authMiddleware,
  notificationController.unreadNotification
);

router.patch(
  "/mark-as-read/:id",
  middleware.authMiddleware,
  [validator.objectIdValidator("id", 'param')],
  validator.handleValidationErrors,
  notificationController.markAsRead
);
module.exports = router;
