import { useState, useEffect } from "react";
import StartChatModal from "../../components/startChatModal/startChatModal";
import HeaderSidebarSwitch from "../../components/headerSidebarSwitch/headerSidebarSwitch";
import "./messagesPage.css";
import { useNavigate } from "react-router-dom";
import { AUTH_HEADER, JSON_HEADERS, BACKEND_URL } from "../../config/config";
import { jwtDecode } from "jwt-decode";
import { RiChatNewFill } from "react-icons/ri";
import Loader from "../../components/loader/loader";
import { TbMessagePlus } from "react-icons/tb";
import { useFeedback } from "../../context/feedbackContext";
import useTokenVerification from "../../hooks/useTokenVerification";
import useTokenValidation from "../../hooks/useTokenVerification";

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
  const [conversations, setConversations] = useState([]);
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);

  const { showFeedback } = useFeedback();

  const token = localStorage.getItem("token");

  const { isValid, loading: tokenLoading } = useTokenValidation(token);

  useEffect(() => {
    if (!isValid && !tokenLoading) {
      navigate("/explore");
      localStorage.removeItem("token");
    }
  }, [navigate, isValid, tokenLoading]);

  const userId = token && jwtDecode(token).userId;
  const headers = token
    ? {
        ...JSON_HEADERS,
        ...AUTH_HEADER(token),
      }
    : {
        JSON_HEADERS,
      };

  useEffect(() => {
    if (!token) {
      navigate("/explore");
    }
  }, [navigate]);

  useEffect(() => {
    fetchConversations();
    fetchFollowing();
  }, []);

  useEffect(() => {
    console.log("Updated conversations:", conversations);
  }, [conversations]);

  const fetchConversations = async () => {
    setIsLoading(true);
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
      // console.log(responseData);
      // console.log(responseData[0]);
      // console.log(responseData[0]._id);

      setConversations(responseData);
      // console.log(conversations);
    } catch (error) {
      console.log("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFollowing = async () => {
    setIsLoadingFollowing(true);
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
    } finally {
      setIsLoadingFollowing(false);
    }
  };

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
      showFeedback("Error starting conversation", "error");
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
        </div>

        {/* Render list of conversations here */}
        {isLoading ? (
          <Loader />
        ) : (
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
        )}

        <div className="newConversationTab">
          <big>
            Start new conversation <TbMessagePlus />
          </big>
          {isLoadingFollowing ? (
            <Loader />
          ) : (
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
          )}
        </div>
      </div>
    </>
  );
}

export default MessagesPage;
