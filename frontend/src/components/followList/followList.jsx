import { AUTH_HEADER, JSON_HEADERS, BACKEND_URL } from "../../config/config";
import "./followList.css";
import { IoClose } from "react-icons/io5";
import { useState, useEffect } from "react";
import useTokenVerification from "../../hooks/useTokenVerification";
import useTokenValidation from "../../hooks/useTokenVerification";
import { useNavigate } from "react-router-dom";
import Loader from "../loader/loader";

function FollowList({
  isVisible,
  followUsers,
  type,
  toggleVisibility,
  totalFollowers,
  totalFollowing,
}) {
  const [followUsersState, setFollowUsersState] = useState(followUsers);
  const token = localStorage.getItem("token");

  const { isValid, loading: tokenLoading } = useTokenValidation(token);

  const navigate = useNavigate();

  useEffect(() => {
    if (!tokenLoading) {
      if (!isValid) {
        localStorage.removeItem("token");
        navigate("/explore");
      }
    }
  }, [navigate, tokenLoading, isValid]);

  const headers = token
    ? {
        ...JSON_HEADERS,
        ...AUTH_HEADER(token),
      }
    : JSON_HEADERS;

  // Fetch follow status when follow list is visible
  useEffect(() => {
    if (isVisible) {
      const fetchFollowStatus = async () => {
        const updatedFollowUsers = await Promise.all(
          followUsers.map(async (user) => {
            try {
              const response = await fetch(
                `${BACKEND_URL}/api/user/${user._id}/is-following`,
                {
                  method: "GET",
                  headers: headers,
                }
              );
              const result = await response.json();
              return {
                ...user,
                isFollowing: result.isFollowing,
                isRequested: result.followRequestPending,
              };
            } catch (error) {
              console.error("Error fetching follow status", error);
              return user; // Return the original user if there's an error
            }
          })
        );
        setFollowUsersState(updatedFollowUsers);
      };

      fetchFollowStatus();
      // console.log(followUsersState);
    }
  }, [isVisible, followUsers, headers]);

  const handleFollow = async (userId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/${userId}/follow`, {
        method: "POST",
        headers: headers,
      });

      if (response.ok) {
        const result = await response.json();

        // Update the UI depending on whether it's a public follow or a follow request
        const updatedFollowUsers = followUsersState.map((user) => {
          if (user._id === userId) {
            if (result.message === "Follow request sent successfully") {
              // If it's a private profile, mark as requested
              return { ...user, isFollowing: false, isRequested: true };
            } else if (result.message === "Followed user successfully") {
              // If it's a public profile, mark as following
              return { ...user, isFollowing: true, isRequested: false };
            }
          }
          return user;
        });

        setFollowUsersState(updatedFollowUsers);
      } else {
        console.error("Failed to follow user");
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  return (
    <>
      {isVisible && (
        <>
          <div className="followListOverlay" onClick={toggleVisibility}></div>
          <div className="followList">
            <div className="followListHeader">
              <p>{type}</p>
              <button onClick={toggleVisibility}>
                <IoClose />
              </button>
            </div>
            <div className="followUsersList">
              {/* Case 1: No followers/following */}
              {type === "Followers" ? (
                totalFollowers === 0 ? (
                  <div className="emptyFollowListMessage">
                    <p>This user doesn't have any followers yet.</p>
                  </div>
                ) : followUsersState.length > 0 ? (
                  // Case 2: There are users in the follow list
                  followUsersState.map((user) => (
                    <div className="followUser" key={user._id}>
                      <div className="followUserAvatar">
                        <img
                          src={user.avatar}
                          alt={user.userName}
                          className="avatar"
                        />
                      </div>

                      <div className="followUserInfo">
                        <p>{user.userName}</p>
                        <p className="grey">{user.fullName}</p>
                      </div>
                      <button
                        className={`followUserBtn ${
                          user.isFollowing
                            ? "following"
                            : user.isRequested
                            ? "requested"
                            : ""
                        }`}
                        onClick={() => handleFollow(user._id)} // Trigger follow action
                        disabled={user.isFollowing || user.isRequested} // Disable button if already following or requested
                      >
                        {user.isFollowing ? (
                          <p className="following">Following</p>
                        ) : user.isRequested ? (
                          <p className="requested">Requested</p>
                        ) : (
                          <p>Follow</p>
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  // Case 3: Logged-in user is the only follower/following
                  <div className="emptyFollowListMessage">
                    <p>It looks like you're their only follower! 😊</p>
                  </div>
                )
              ) : totalFollowing === 0 ? (
                <div className="emptyFollowListMessage">
                  <p>This user isn't following anyone yet.</p>
                </div>
              ) : followUsersState.length > 0 ? (
                followUsersState.map((user) => (
                  <div className="followUser" key={user._id}>
                    <div className="followUserAvatar">
                      <img
                        src={user.avatar}
                        alt={user.userName}
                        className="avatar"
                      />
                    </div>

                    <div className="followUserInfo">
                      <p>{user.userName}</p>
                      <p className="grey">{user.fullName}</p>
                    </div>
                    <button
                      className={`followUserBtn ${
                        user.isFollowing
                          ? "following"
                          : user.isRequested
                          ? "requested"
                          : ""
                      }`}
                      onClick={() => handleFollow(user._id)} // Trigger follow action
                      disabled={user.isFollowing || user.isRequested} // Disable button if already following or requested
                    >
                      {user.isFollowing ? (
                        <p className="following">Following</p>
                      ) : user.isRequested ? (
                        <p className="requested">Requested</p>
                      ) : (
                        <p>Follow</p>
                      )}
                    </button>
                  </div>
                ))
              ) : (
                // Case 3: Logged-in user is the only one being followed
                <div className="emptyFollowListMessage">
                  <p>You're the only one they're following! 😊</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default FollowList;
