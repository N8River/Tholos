import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "./chat.css";
import { BACKEND_URL, JSON_HEADERS, AUTH_HEADER } from "../../config/config";
import { jwtDecode } from "jwt-decode";
import { useRef } from "react";
import Loader from "../loader/loader";

const socket = io(BACKEND_URL);

function Chat() {
  const { otherpersonId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null); // Store conversationId
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(""); // Tracking who is typing
  const token = localStorage.getItem("token");
  const userId = token && jwtDecode(token).userId;

  const [isLoading, setIsLoading] = useState(false);

  const headers = {
    ...JSON_HEADERS,
    ...AUTH_HEADER(token),
  };

  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (conversationId) {
      // Emit event to mark messages as read
      socket.emit("messageRead", { conversationId, userId });
    }
  }, [conversationId]);

  useEffect(() => {
    const fetchConversationAndMessages = async () => {
      setIsLoading(true);
      try {
        // Fetch the conversationId
        const conversationResponse = await fetch(
          `${BACKEND_URL}/api/conversation/get-conversation/${otherpersonId}`,
          { headers }
        );
        const conversationData = await conversationResponse.json();
        setConversationId(conversationData.conversationId);

        // Join the conversation room
        socket.emit("joinRoom", {
          conversationId: conversationData.conversationId,
        });

        // Fetch the messages for the conversation
        const messageResponse = await fetch(
          `${BACKEND_URL}/api/message/messages/${conversationData.conversationId}`,
          { headers }
        );
        const messageData = await messageResponse.json();
        setMessages(messageData);
      } catch (error) {
        console.log("Error fetching conversation/messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversationAndMessages();

    socket.on("message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // TYping events
    socket.on("typing", ({ senderId }) => {
      if (senderId !== userId) {
        setTypingUser("Other person is typing...");
      }
    });
    socket.on("stopTyping", ({ senderId }) => {
      if (senderId !== userId) {
        setTypingUser(""); // Removes typing indicator
      }
    });

    return () => {
      socket.off();
    };
  }, [otherpersonId]);

  const handleTyping = (e) => {
    setMessage(e.target.value);

    // Emit typing event when the user starts typing
    socket.emit("typing", {
      conversationId,
      senderId: userId,
    });

    // Clear previous timeout if typing continues
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit stopTyping event after a delay (e.g., 3 seconds)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        conversationId,
        senderId: userId,
      });
    }, 3000); // Stops typing after 3 seconds of no typing
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", {
        conversationId,
        senderId: userId,
        text: message,
      });
      setMessage("");
    }
  };

  return (
    <div className="chatContainer">
      {isLoading ? (
        <Loader />
      ) : (
        <div className="chatMessages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.sender._id === userId ? "sent" : "received"
              } ${msg.read ? "read" : "unread"}`} // Use "sent" for current user, "received" for other user
            >
              {console.log(msg)}
              {msg.text}
            </div>
          ))}
        </div>
      )}

      {typingUser && <div className="typingIndicator">{typingUser}</div>}

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
