import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./chat.css";
import { BACKEND_URL, JSON_HEADERS, AUTH_HEADER } from "../../config/config";
import Loader from "../loader/loader";
import { formatDateHeader } from "../../utils/utils";
import { useFeedback } from "../../context/feedbackContext";
import useTokenValidation from "../../hooks/useTokenVerification";
import { jwtDecode } from "jwt-decode";

const socket = io(BACKEND_URL);

function Chat() {
  const { otherpersonId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  const [otherUser, setOtherUser] = useState(null); // NEW

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const {
    decodedToken,
    isValid,
    loading: tokenLoading,
  } = useTokenValidation(token);
  const userId = jwtDecode(token)?.userId;

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showFeedback } = useFeedback();

  const chatContainerRef = useRef(null);
  const typingBubbleRef = useRef(null); // NEW: ref to measure bubble height
  const previousTypingState = useRef(isOtherTyping); // NEW: track changes in typing

  const headers = {
    ...JSON_HEADERS,
    ...AUTH_HEADER(token),
  };

  const typingTimeoutRef = useRef(null);

  // If token invalid -> redirect
  useEffect(() => {
    if (!tokenLoading && !isValid && token) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [isValid, tokenLoading, token, navigate]);

  // Dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark-mode") {
      document.body.classList.add("dark-mode");
      setIsDarkMode(true);
    }
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Smooth scroll logic for typing bubble appear/disappear
  useEffect(() => {
    if (!chatContainerRef.current) return;

    // If the typing state just turned ON, scroll to bottom
    if (!previousTypingState.current && isOtherTyping) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
    // If it just turned OFF, scroll up by the bubble's height
    else if (previousTypingState.current && !isOtherTyping) {
      if (typingBubbleRef.current) {
        const bubbleHeight = typingBubbleRef.current.clientHeight || 0;
        // Move up by bubbleHeight so it's not jarring
        chatContainerRef.current.scrollBy({
          top: -bubbleHeight,
          behavior: "smooth",
        });
      }
    }

    previousTypingState.current = isOtherTyping;
  }, [isOtherTyping]);

  // Fetch the other user’s data for their avatar (if needed)
  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/user/${otherpersonId}`, {
          headers,
        });
        const data = await res.json();
        setOtherUser(data);
      } catch (err) {
        console.error("Error fetching other user info:", err);
      }
    };
    fetchOtherUser();
  }, [otherpersonId]);

  // Load conversation & messages
  useEffect(() => {
    const fetchConversationAndMessages = async () => {
      setIsLoading(true);
      try {
        // 1. get conversation ID
        const conversationResponse = await fetch(
          `${BACKEND_URL}/api/conversation/get-conversation/${otherpersonId}`,
          { headers }
        );
        const conversationData = await conversationResponse.json();
        setConversationId(conversationData.conversationId);

        // 2. join room
        socket.emit("joinRoom", {
          conversationId: conversationData.conversationId,
        });

        // 3. fetch messages
        const messageResponse = await fetch(
          `${BACKEND_URL}/api/message/messages/${conversationData.conversationId}`,
          { headers }
        );
        const messageData = await messageResponse.json();
        setMessages(messageData);
      } catch (error) {
        console.error("Error fetching conversation/messages:", error);
        showFeedback("Failed to load conversation or messages", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversationAndMessages();

    // Socket: when a new message arrives
    socket.on("message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Socket: handle typing events
    socket.on("typing", ({ senderId }) => {
      if (senderId !== userId) {
        setIsOtherTyping(true);
      }
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (senderId !== userId) {
        setIsOtherTyping(false);
      }
    });

    return () => {
      // Clean up
      socket.off("message");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [otherpersonId]);

  // Mark messages read if conversationId changes
  useEffect(() => {
    if (conversationId) {
      socket.emit("messageRead", { conversationId, userId });
    }
  }, [conversationId, userId]);

  // Handle typing
  const handleTyping = (e) => {
    setMessage(e.target.value);

    // Emit typing event
    socket.emit("typing", {
      conversationId,
      senderId: userId,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout for stopTyping
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        conversationId,
        senderId: userId,
      });
    }, 3000);
  };

  // Send message
  const handleSendMessage = () => {
    if (message.trim()) {
      // Clear typing timeout and emit stopTyping immediately
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.emit("stopTyping", {
        conversationId,
        senderId: userId,
      });

      // Send the message
      socket.emit("sendMessage", {
        conversationId,
        senderId: userId,
        text: message,
      });
      setMessage("");
    }
  };

  // Simple date header util
  const formatDateHeader = (dateString) => {
    return new Date(dateString).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="chatContainer">
      {isLoading || tokenLoading ? (
        <Loader />
      ) : (
        <div className="chatMessages" ref={chatContainerRef}>
          {messages.map((msg, index) => {
            const currentMessageDate = new Date(msg.createdAt).toDateString();
            const previousMessageDate =
              index > 0
                ? new Date(messages[index - 1].createdAt).toDateString()
                : null;
            const showDateHeader = currentMessageDate !== previousMessageDate;

            return (
              <div className="messageContainer" key={msg._id}>
                {showDateHeader && (
                  <div className="dateHeader">
                    {formatDateHeader(msg.createdAt)}
                  </div>
                )}

                {msg.sender._id !== userId ? (
                  <div className="receivedMessage">
                    <div className="chatAvatar">
                      <img src={msg.sender.avatar} alt="User Avatar" />
                    </div>
                    <div
                      className={`message received ${
                        msg.read ? "read" : "unread"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`message sent ${msg.read ? "read" : "unread"}`}
                  >
                    {msg.text}
                  </div>
                )}
              </div>
            );
          })}

          {/* If the other user is typing, show the bubble */}
          {isOtherTyping && (
            <div className="messageContainer" ref={typingBubbleRef}>
              <div className="receivedMessage typingBubble">
                <div className="chatAvatar">
                  {/* Display the other user’s avatar (instead of placeholder) */}
                  <img
                    src={
                      otherUser?.avatar || "https://placehold.co/40?text=..."
                    }
                    alt="Typing Avatar"
                  />
                </div>
                <div className="message received typingDots">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="chatInput">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={handleTyping}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
