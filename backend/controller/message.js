const Message = require("../model/message");

exports.fetchMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

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
