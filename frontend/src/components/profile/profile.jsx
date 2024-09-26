import { useNavigate } from "react-router-dom";
import "./profile.css";
import { IoIosSettings } from "react-icons/io";
import { BACKEND_URL, JSON_HEADERS, AUTH_HEADER } from "../../config/config";
import { useEffect, useState } from "react";
import UserProfilePostCard from "../userProfilePostCard/userProfilePostCard";
import { jwtDecode } from "jwt-decode";

import Loader from "../loader/loader";
import LoginModal from "../loginModal/loginModal";

function Profile({ isOwner, user, handleLogOut }) {
  console.log("🔴 User", user);

  const token = localStorage.getItem("token");
  const headers = token
    ? {
        ...JSON_HEADERS,
        ...AUTH_HEADER(token),
      }
    : {
        ...JSON_HEADERS,
      };

  const navigate = useNavigate();

  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followRequestPending, setFollowRequestPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false); // Modal state

  const decodedToken = token && jwtDecode(token);
  // console.log("🔴 decodedToken", decodedToken);

  const loggedInUserId = token && decodedToken.userId;
  const [profilePrivateError, setProfilePrivateError] = useState(false); // State for handling private profile error

  useEffect(() => {
    if (user && user.userName) {
      const fetchUserPosts = async () => {
        setIsLoading(true);

        try {
          const response = await fetch(
            `${BACKEND_URL}/api/post/user-posts/${user.userName}?isOwner=${isOwner}&currentUserId=${loggedInUserId}`,
            {
              headers: JSON_HEADERS,
            }
          );

          if (!response.ok) {
            // If the status is 403, it means the profile is private
            if (response.status === 403) {
              const errorData = await response.json();
              setProfilePrivateError(true);
              throw new Error(errorData.message);
            }
            throw new Error("Failed to fetch user posts");
          }

          const responseData = await response.json();

          setUserPosts(responseData);
          console.log("responseData", responseData);
          setProfilePrivateError(false); // Reset if posts are fetched successfully
        } catch (error) {
          console.log("Error fetching user's post:", error);
        } finally {
          setIsLoading(false);
        }
      };

      const checkFollowStatus = async () => {
        if (!token) {
          setIsFollowing(false);
          setIsFollowingLoading(false);
          return;
        }
        setIsFollowingLoading(true);

        try {
          const response = await fetch(
            `${BACKEND_URL}/api/user/${user._id}/is-following`,
            {
              headers: headers,
            }
          );

          if (!response.ok) {
            throw new Error("Failed to check follow status");
          }

          const { isFollowing, followRequestPending } = await response.json();
          setIsFollowing(isFollowing);
          setFollowRequestPending(followRequestPending);
        } catch (error) {
          console.log("Error checking follow status:", error);
        } finally {
          setIsFollowingLoading(false);
        }
      };

      fetchUserPosts();
      checkFollowStatus();
    }
  }, [user, token, isOwner, loggedInUserId]);

  // Check if user data is still loading
  if (!user || !user.userName) {
    return <Loader />; // Display a loader while user data is being fetched
  }

  // console.log("🧑🏽‍🦱 USER", user);

  const handleFollow = async () => {
    if (!token) {
      setShowLoginModal(true);
      return;
    }

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
      if (result.message === "Follow request sent successfully") {
        setFollowRequestPending(true); // Show "Requested" if follow request is pending
      } else if (result.message === "Followed user successfully") {
        setIsFollowing(true); // Show "Unfollow" if the user is now following
      }
    } catch (error) {
      console.error("Error following user", error);
    }
  };

  const handleUnfollow = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/user/${user._id}/unfollow`,
        {
          method: "POST",
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to unfollow the user");
      }

      // Update the local `user` state to reflect the new follower count
      // setCurrentUser((prevUser) => ({
      //   ...prevUser,
      //   followers: prevUser.followers.filter(
      //     (followerId) => followerId !== loggedInUserId // Remove the current logged-in user's ID from the followers list
      //   ),
      // }));

      setIsFollowing(false);
    } catch (error) {
      console.error("Error unfollowing user", error);
    }
  };

  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 1
    ) {
      if (!token && !loginModalShown) {
        setShowLoginModal(true);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div className="profile">
        <div className="profileInfo">
          <div className="profileDetails">
            <div className="profilePic">
              <img src={user.avatar} alt="" />{" "}
            </div>
            <div className="profileDesc">
              <div className="profileDescHeader">
                <h4>{user.userName}</h4>

                {isFollowingLoading ? (
                  <Loader />
                ) : (
                  <button
                    className="btn"
                    onClick={() => {
                      if (isOwner) {
                        navigate(`/${user.userName}/edit`);
                      } else {
                        if (isFollowing) {
                          handleUnfollow();
                        } else if (followRequestPending) {
                          console.log("Follow request already sent");
                        } else {
                          handleFollow();
                        }
                      }
                    }}
                  >
                    {isOwner ? (
                      <big>EDIT PROFILE</big>
                    ) : isFollowing ? (
                      <big>UNFOLLOW</big>
                    ) : followRequestPending ? (
                      <big>REQUESTED</big>
                    ) : (
                      <big>FOLLOW</big>
                    )}
                  </button>
                )}

                {isOwner ? (
                  <button className="btn" onClick={handleLogOut}>
                    <IoIosSettings />
                  </button>
                ) : (
                  ""
                )}
              </div>
              <div className="profileDescSubHeader">
                <p>Followers: {user.followers ? user.followers.length : 0}</p>
                <p>Following: {user.following ? user.following.length : 0}</p>
              </div>

              <div className="profileDescBio">
                <big>{user.fullName}</big>
                <p>{user.bio}</p>{" "}
              </div>
            </div>
          </div>
          <div className="profileHighlights"></div>
        </div>
        <div className="profilePosts">
          {isLoading ? (
            <Loader />
          ) : profilePrivateError ? (
            <p className="privateErrorMessage">
              This account is private. Follow to see the posts.
            </p>
          ) : (
            userPosts &&
            userPosts.map((post) => (
              <UserProfilePostCard post={post} key={post._id} />
            ))
          )}
        </div>
      </div>

      {showLoginModal && <LoginModal user={user} />}
    </>
  );
}

export default Profile;
