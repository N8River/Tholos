import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL, JSON_HEADERS, AUTH_HEADER } from "../../config/config";

function StartChatModal({ onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const headers = {
    ...JSON_HEADERS,
    ...AUTH_HEADER(token),
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/user/search?query=${searchQuery}`,
        {
          method: "GET",
          headers,
        }
      );
      const data = await response.json();
      setSearchResults(data.users);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleStartChat = async (otherPersonId) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/conversation/start-conversation`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ otherPersonId }),
        }
      );

      const data = await response.json();
      navigate(`/messages/${otherPersonId}`); // Redirect to the chat page with the other user
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h3>Start a New Chat</h3>
        <input
          type="text"
          placeholder="Search by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>

        <div className="searchResults">
          {searchResults.map((user) => (
            <div key={user._id} onClick={() => handleStartChat(user._id)}>
              {user.userName}
            </div>
          ))}
        </div>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default StartChatModal;
