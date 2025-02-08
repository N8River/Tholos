import { useEffect, useState } from "react";
import { AUTH_HEADER, BACKEND_URL, JSON_HEADERS } from "../../config/config";
import "./followSuggestion.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Loader from "../loader/loader";

import useResponsive from "../../hooks/useResponsive";
import useTokenVerification from "../../hooks/useTokenVerification";
import useTokenValidation from "../../hooks/useTokenVerification";

function FollowSuggestion({ noFollowing }) {
  const token = localStorage.getItem("token");

  // useTokenVerification();

  const { isValid, loading: tokenLoading } = useTokenValidation(token);

  const navigate = useNavigate();
  useEffect(() => {
    if (!tokenLoading) {
      if (!isValid) {
        localStorage.removeItem("token");
        navigate("/explore");
      }
    }
  }, [navigate, isValid, tokenLoading]);

  const isMobile = useResponsive(1280);

  const headers = {
    ...JSON_HEADERS,
    ...AUTH_HEADER(token),
  };

  const [followSuggestions, setFollowSuggestions] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isVisible, setVisible] = useState(!!token);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async (userId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/${userId}/follow`, {
        method: "POST",
        headers: headers,
      });

      if (!response.ok) {
        throw new Error("Failed to follow the user");
      }

      const result = await response.json();

      // Check if the follow request was sent or if the user is now following
      if (result.message === "Followed user successfully") {
        setIsFollowing(true); // Show "Unfollow" if the user is now following
      }

      if (result.message === "Followed user successfully") {
        // Update the specific user's follow status
        setFollowSuggestions((prevSuggestions) =>
          prevSuggestions.map((user) =>
            user._id === userId ? { ...user, isFollowing: true } : user
          )
        );
      }
    } catch (error) {
      console.error("Error following user", error);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async (numberOfSuggestions) => {
      setIsLoading(true);

      const headers = {
        ...JSON_HEADERS,
        ...AUTH_HEADER(token),
      };

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/user/follow-suggestions?numberOfSuggestions=${numberOfSuggestions}`,
          {
            method: "GET",
            headers: headers,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch follow suggestions");
        }

        const data = await response.json();

        const suggestionsWithFollowStatus = data.suggestions.map((user) => ({
          ...user,
          isFollowing: false, // Set default follow status to false
        }));

        setFollowSuggestions(suggestionsWithFollowStatus);
      } catch (error) {
        console.error("Error fetching follow suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions(5);
  }, []);

  return (
    <>
      {isVisible ? (
        <div className={`followSuggestion ${noFollowing ? "noFollowing" : ""}`}>
          <p>Suggested for you</p>
          {isLoading || tokenLoading ? (
            <Loader />
          ) : (
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
                  <div
                    className="followSuggestionBtn"
                    onClick={() => {
                      handleFollow(user._id);
                    }}
                  >
                    <button>
                      {user.isFollowing ? (
                        <p className="following">Following</p>
                      ) : (
                        <p>Follow</p>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        ""
      )}
    </>
  );
}

export default FollowSuggestion;
