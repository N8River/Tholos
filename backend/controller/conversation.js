const Conversation = require("../model/conversation");
const Message = require("../model/message");

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
    const userId = req.user.userId;

    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    }).populate("participants", "userName avatar");

    // REMOVE or SKIP BROKEN CONVERSATIONS
    const validConversations = conversations.filter((convo) => {
      // e.g. skip any conversation that has a null participant or fewer than 2
      if (!convo.participants || convo.participants.length < 2) {
        return false;
      }
      // If any participant is null or missing fields
      if (convo.participants.some((p) => p === null)) {
        return false;
      }
      return true;
    });

    // Then fetch lastMessage for each validated conversation
    const conversationsWithLastMessage = await Promise.all(
      validConversations.map(async (conversation) => {
        const lastMessage = await Message.findOne({
          conversationId: conversation._id,
        })
          .sort({ createdAt: -1 })
          .select("text createdAt");

        return {
          ...conversation.toObject(),
          lastMessage: lastMessage ? lastMessage.text : "",
          lastMessageTimestamp: lastMessage ? lastMessage.createdAt : null,
        };
      })
    );

    res.status(200).json(conversationsWithLastMessage);
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

