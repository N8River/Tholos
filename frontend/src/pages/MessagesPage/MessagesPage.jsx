import { useState, useEffect } from "react";
import StartChatModal from "../../components/startChatModal/startChatModal";
import HeaderSidebarSwitch from "../../components/headerSidebarSwitch/headerSidebarSwitch";
import "./messagesPage.css";
import { useNavigate } from "react-router-dom";
import { AUTH_HEADER, JSON_HEADERS, BACKEND_URL } from "../../config/config";
import { jwtDecode } from "jwt-decode";
import { RiChatNewFill } from "react-icons/ri";

const formatTimestamp = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);

  // Calculate time difference in milliseconds
  const diff = now - date;

  // Less than a minute ago
  if (diff < 60000) {
    return "Just now";
  }

  // If the message was sent today
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // If the message was sent within the same year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // If the message was sent in a different year
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function MessagesPage() {
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();

  // const openModal = () => setIsModalOpen(true);
  // const closeModal = () => setIsModalOpen(false);

  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userId;
  const headers = {
    ...JSON_HEADERS,
    ...AUTH_HEADER(token),
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/conversation/conversations`,
          {
            method: "GET",
            headers: headers,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }

        const responseData = await response.json();
        setConversations(responseData);
      } catch (error) {
        console.log("Error fetching conversations:", error);
      }
    };

    const fetchFollowing = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/user/following`, {
          method: "GET",
          headers: headers,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch following users");
        }

        const responseData = await response.json();
        setFollowing(responseData.following);
      } catch (error) {
        console.log("Error fetching following users:", error);
      }
    };

    fetchConversations();
    fetchFollowing();
  }, []);

  const handleStartConversation = async (otherPersonId) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/conversation/start-conversation`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ otherPersonId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to start conversation");
      }

      const data = await response.json();

      // Update the conversations state with the new conversation
      const newConversation = {
        _id: data.conversationId,
        participants: following.filter((user) => user._id === otherPersonId),
        lastMessage: "",
        lastMessageTimestamp: "",
      };
      setConversations([...conversations, newConversation]);

      // Navigate to the new chat page with the other user
      navigate(`/messages/${otherPersonId}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const handleConversationClick = (conversationId, otherPersonId) => {
    // Navigate to the chat page for this conversation
    navigate(`/messages/${otherPersonId}`);
  };

  // Get the IDs of users already in conversations
  const existingConversationUserIds = conversations
    .map((conversation) =>
      conversation.participants.find(
        (participant) => participant._id !== userId
      )
    )
    .map((participant) => participant._id);

  // Filter the following users who don't have an existing conversation
  const newConversationUsers = following.filter(
    (user) => !existingConversationUserIds.includes(user._id)
  );

  return (
    <>
      <HeaderSidebarSwitch />
      <div className="messagesPage">
        <div className="messagesPageHeader">
          <h2>Your Conversations</h2>
          {/* <button className="btn" onClick={openModal}>
            Start New Chat
            <RiChatNewFill />
          </button> */}
        </div>

        {/* Modal to start a chat */}
        {/* {isModalOpen && <StartChatModal onClose={closeModal} />} */}

        {/* Render list of conversations here */}
        <div className="conversationsList">
          {conversations.length > 0 ? (
            conversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(
                (participant) => participant._id !== userId
              );

              const lastMessage = conversation.lastMessage || "";
              const lastMessageTimestamp = conversation.lastMessageTimestamp
                ? formatTimestamp(conversation.lastMessageTimestamp)
                : "";

              // console.log("🔴 Conversation", conversation);

              return (
                <div
                  key={conversation._id}
                  className="conversationItem"
                  onClick={() =>
                    handleConversationClick(
                      conversation._id,
                      otherParticipant._id
                    )
                  }
                >
                  <div className="conversationUserImgWrapper">
                    <img src={otherParticipant.avatar} alt="avatar" />
                  </div>
                  <div className="conversationInfo">
                    <div className="conversationUserInfo">
                      <h4>{otherParticipant.userName}</h4>
                      <p className="lastMessage">{lastMessage}</p>
                    </div>
                    <div className="conversationTimestamp">
                      <small className="lastMessageTimestamp">
                        {lastMessageTimestamp}
                      </small>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No conversations yet.</p>
          )}
        </div>

        <div className="newConversationTab">
          <big>Start new conversation</big>
          <div className="newConversationList">
            {newConversationUsers.length > 0
              ? newConversationUsers.map((user) => (
                  <div
                    key={user._id}
                    className="newConversationUser"
                    onClick={() => handleStartConversation(user._id)}
                  >
                    <div className="newConversationUserAvatar">
                      <img src={user.avatar} alt="" />
                    </div>
                    <div className="newConversationUserName">
                      <p>{user.userName}</p>
                    </div>
                  </div>
                ))
              : "Follow some people to start a conversation with them!"}
          </div>
        </div>
      </div>
    </>
  );
}

export default MessagesPage;
