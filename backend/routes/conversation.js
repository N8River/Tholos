const express = require("express");
const router = express.Router();

const conversationController = require("../controller/conversation");
const middleware = require("../middleware/is-auth");

router.post(
  "/start-conversation",
  middleware.authMiddleware,
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
  conversationController.getConversationByParticipants
);

module.exports = router;
