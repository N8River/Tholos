const express = require("express");
const router = express.Router();

const validator = require("../middleware/validator");
const middleware = require("../middleware/is-auth");

const messageController = require("../controller/message");

router.get(
  "/messages/:conversationId",
  middleware.authMiddleware,
  [validator.objectIdValidator("conversationId", "param")],
  validator.handleValidationErrors,
  messageController.fetchMessages
);

module.exports = router;
