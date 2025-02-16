const Message = require("../model/message");
const Conversation = require("../model/conversation");

exports.fetchMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId; // Get userId from auth middleware

    // Check if the user is a participant in this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId, // Only return if user is in the conversation
    });

    if (!conversation) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({ conversationId }).populate(
      "sender",
      "userName avatar"
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch messages", error: error.message });
  }
};
