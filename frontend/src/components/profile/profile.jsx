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
  // const userInfo = useUserInfo();
  // const [fetchedUserInfo, setFetchedUserInfo] = useState();

  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  // const [loadingFollowStatus, setLoadingFollowStatus] = useState(true);

  const decodedToken = jwtDecode(token);
  console.log("🔴 decodedToken", decodedToken);
  const loggedInUserId = decodedToken.userId;

  // useEffect(() => {
  //   if (userInfo) {
  //     setFetchedUserInfo(userInfo);
  //     console.log("😞😞😞", userInfo);
  //   }
  // }, [userInfo]);

  useEffect(() => {
    if (user.userName) {
      const fetchUserPosts = async () => {
        try {
          const response = await fetch(
            `${BACKEND_URL}/api/post/user-posts/${user.userName}`,
            {
              headers: JSON_HEADERS,
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch user posts");
          }

          const responseData = await response.json();

          setUserPosts(responseData);
          console.log("responseData", responseData);
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

          const { isFollowing } = await response.json();
          console.log(isFollowing);

          setIsFollowing(isFollowing);
          // setLoadingFollowStatus(false);
        } catch (error) {
          // setLoadingFollowStatus(false);
          console.log("Error checking follow status:", error);
        }
      };

      fetchUserPosts();
      checkFollowStatus();
    }
  }, [user.userName]);

  console.log("USER", user);

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

      // Update the local `user` state to reflect the new follower count
      // setCurrentUser((prevUser) => ({
      //   ...prevUser,
      //   followers: [...prevUser.followers, loggedInUserId], // Add the current logged-in user's ID to the followers list
      // }));

      setIsFollowing(true);
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
                    isFollowing ? handleUnfollow() : handleFollow(); // Show follow/unfollow based on the state
                  }
                }}
              >
                {isOwner ? (
                  <big>EDIT PROFILE</big>
                ) : (
                  <big>{isFollowing ? "UNFOLLOW" : "FOLLOW"}</big>
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
        {userPosts &&
          userPosts.map((post) => {
            return <UserProfilePostCard post={post} key={post._id} />;
          })}
      </div>
    </div>
  );
}

export default Profile;
