const express = require("express");
const router = express.Router();

const validator = require("../middleware/validator");

const messageController = require("../controller/message");

router.get(
  "/messages/:conversationId",
  [validator.objectIdValidator("conversationId", "param")],
  validator.handleValidationErrors,
  messageController.fetchMessages
);

module.exports = router;
