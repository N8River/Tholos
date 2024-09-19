import { useEffect, useState } from "react";
import { AUTH_HEADER, BACKEND_URL, JSON_HEADERS } from "../../config/config";
import "./followSuggestion.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem("token");
const decodedToken = token ? jwtDecode(token) : null;

const headers = {
  ...JSON_HEADERS,
  ...AUTH_HEADER(token),
};

function FollowSuggestion() {
  const [followSuggestions, setFollowSuggestions] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isVisible, setVisible] = useState(!!token);

  const navigate = useNavigate();

  const handleFollow = async (user) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/user/${user._id}/follow`,
        {
          method: "POST",
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to follow the user");
      }

      const result = await response.json();

      // Check if the follow request was sent or if the user is now following
      if (result.message === "Followed user successfully") {
        setIsFollowing(true); // Show "Unfollow" if the user is now following
      }
    } catch (error) {
      console.error("Error following user", error);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      const token = localStorage.getItem("token");
      const headers = {
        ...JSON_HEADERS,
        ...AUTH_HEADER(token),
      };

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/user/follow-suggestions`,
          {
            method: "GET",
            headers: headers,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch follow suggestions");
        }

        const data = await response.json();
        setFollowSuggestions(data.suggestions);
      } catch (error) {
        console.error("Error fetching follow suggestions:", error);
      }
    };

    fetchSuggestions();
  }, []);

  return (
    <>
      {isVisible ? (
        <div className="followSuggestion">
          <p>Suggested for you</p>
          <div className="followSuggestions">
            {followSuggestions.map((user) => (
              <div className="followSuggestionUser" key={user._id}>
                <div
                  className="followSuggestionUserAvatar"
                  onClick={() => {
                    navigate(`/${user.userName}`);
                  }}
                >
                  <img src={user.avatar} alt={user.userName} />
                </div>
                <div
                  className="followSuggestionUserName"
                  onClick={() => {
                    navigate(`/${user.userName}`);
                  }}
                >
                  <p>{user.userName}</p>
                  <p className="grey">{user.fullName}</p>
                </div>
                <div className="followSuggestionBtn">
                  <button>Follow</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
}

export default FollowSuggestion;
