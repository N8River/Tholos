import { useNavigate } from "react-router-dom";
import "./profile.css";
import { IoIosSettings } from "react-icons/io";
import { BACKEND_URL, JSON_HEADERS, AUTH_HEADER } from "../../config/config";
import { useEffect, useState } from "react";
import UserProfilePostCard from "../userProfilePostCard/userProfilePostCard";
import { jwtDecode } from "jwt-decode";
import useUserInfo from "../../hooks/useUserInfo";

const token = localStorage.getItem("token");
const headers = {
  ...JSON_HEADERS,
  ...AUTH_HEADER(token),
};

function Profile({ isOwner, user, handleLogOut }) {
  const navigate = useNavigate();

  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [followRequestPending, setFollowRequestPending] = useState(false);

  const decodedToken = jwtDecode(token);
  console.log("🔴 decodedToken", decodedToken);

  const loggedInUserId = decodedToken.userId;
  const [profilePrivateError, setProfilePrivateError] = useState(false); // State for handling private profile error

  useEffect(() => {
    if (user.userName) {
      const fetchUserPosts = async () => {
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
        }
      };

      const checkFollowStatus = async () => {
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
        }
      };

      fetchUserPosts();
      checkFollowStatus();
    }
  }, [user.userName]);

  console.log("🧑🏽‍🦱 USER", user);

  const handleFollow = async () => {
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

  return (
    <div className="profile">
      <div className="profileInfo">
        <div className="profileDetails">
          <div className="profilePic">
            <img src={user.avatar} alt="" />{" "}
          </div>
          <div className="profileDesc">
            <div className="profileDescHeader">
              <h4>{user.userName}</h4>

              <button
                className="btn"
                onClick={() => {
                  if (isOwner) {
                    navigate(`/${user.userName}/edit`);
                  } else {
                    if (isFollowing) {
                      handleUnfollow();
                    } else if (followRequestPending) {
                      // Do nothing, or show a message
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
        {/* Check if the profile is private and not following */}
        {profilePrivateError ? (
          <p className="privateErrorMessage">
            This account is private. Follow to see the posts.
          </p>
        ) : (
          userPosts &&
          userPosts.map((post) => {
            return <UserProfilePostCard post={post} key={post._id} />;
          })
        )}
      </div>
    </div>
  );
}

export default Profile;
