import { useState, useEffect } from "react";
import StartChatModal from "../../components/startChatModal/startChatModal";
import HeaderSidebarSwitch from "../../components/headerSidebarSwitch/headerSidebarSwitch";
import "./messagesPage.css";
import { useNavigate } from "react-router-dom";
import { AUTH_HEADER, JSON_HEADERS, BACKEND_URL } from "../../config/config";
import { jwtDecode } from "jwt-decode";

function MessagesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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

    fetchConversations();
  }, []);

  const handleConversationClick = (conversationId, otherPersonId) => {
    // Navigate to the chat page for this conversation
    navigate(`/messages/${otherPersonId}`);
  };

  return (
    <>
      <HeaderSidebarSwitch />
      <div className="messagesPage">
        <h2>Your Conversations</h2>

        {/* Button to start a new chat */}
        <button className="btn" onClick={openModal}>
          Start New Chat
        </button>

        {/* Modal to start a chat */}
        {isModalOpen && <StartChatModal onClose={closeModal} />}

        {/* Render list of conversations here */}
        <div className="conversationsList">
          {conversations.length > 0 ? (
            conversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(
                (participant) => participant._id !== userId
              );

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
                  <img src={otherParticipant.avatar} alt="avatar" />
                  <div className="conversationInfo">
                    <h4>{otherParticipant.userName}</h4>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No conversations yet.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default MessagesPage;
