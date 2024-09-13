const Conversation = require("../model/conversation");

exports.startConversation = async (req, res) => {
  try {
    const { otherPersonId } = req.body;
    const userId = req.user.userId;

    // Check if a conversation already exists between the two users
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherPersonId] },
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, otherPersonId],
        messages: [],
      });
      await conversation.save();
    }

    res.status(200).json({
      message: "Conversation started",
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ message: "Failed to start conversation" });
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Assuming user ID is stored in the JWT token

    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    }).populate("participants", "userName avatar"); // Populate with user info

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

exports.getConversationByParticipants = async (req, res) => {
  const { otherPersonId } = req.params;
  const userId = req.user.userId;

  // Find conversation between logged-in user and the other person
  let conversation = await Conversation.findOne({
    participants: { $all: [userId, otherPersonId] },
  });

  // If no conversation exists, create a new one
  if (!conversation) {
    conversation = new Conversation({ participants: [userId, otherPersonId] });
    await conversation.save();
  }

  res.status(200).json({ conversationId: conversation._id });
};
