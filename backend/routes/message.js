const express = require("express");
const router = express.Router();

const messageController = require("../controller/message");

router.get("/messages/:conversationId", messageController.fetchMessages);

module.exports = router;
