const express = require("express");
const router = express.Router();

const conversationController = require("../controller/conversation");
const middleware = require("../middleware/is-auth");
const validator = require("../middleware/validator");

router.post(
  "/start-conversation",
  middleware.authMiddleware,
  [validator.objectIdValidator("otherPersonId", "body")],
  validator.handleValidationErrors,
  conversationController.startConversation
);

router.get(
  "/conversations",
  middleware.authMiddleware,
  conversationController.getConversations
);

router.get(
  "/get-conversation/:otherPersonId",
  middleware.authMiddleware,
  [validator.objectIdValidator("otherPersonId", 'param')],
  validator.handleValidationErrors,
  conversationController.getConversationByParticipants
);

module.exports = router;
