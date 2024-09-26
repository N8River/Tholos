import useUserInfo from "../../hooks/useUserInfo";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { JSON_HEADERS, BACKEND_URL, AUTH_HEADER } from "../../config/config";
import { jwtDecode } from "jwt-decode";
import "./UserPage.css";

import HeaderSidebarSwitch from "../../components/headerSidebarSwitch/headerSidebarSwitch";
import Profile from "../../components/profile/profile";
import PostModal from "../../components/postModal/postModal";
import NotFoundPage from "../NotFoundPage/NotFoundPage";
import Loader from "../../components/loader/loader";

function UserPage() {
  const { username, postId } = useParams();
  const { user, error, loading } = useUserInfo(username);
  const navigate = useNavigate();

  // const [user, setUser] = useState({});
  const [post, setPost] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const token = localStorage.getItem("token");
  const headers = token
    ? {
        ...JSON_HEADERS,
        ...AUTH_HEADER(token),
      }
    : JSON_HEADERS;

  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/api/post/${postId}`, {
            method: "GET",
            headers,
          });

          if (response.status === 403) {
            // Handle private post
            setPost(null); // Clear post state
            alert("This post is private. Follow the user to view the post.");
            navigate(`/${username}`); // Redirect to user profile
            return;
          }

          if (!response.ok) {
            throw new Error("Error fetching post");
          }

          const data = await response.json();
          setPost(data);
        } catch (error) {
          console.error("Error fetching post:", error);
        }
      };

      fetchPost();
    }
  }, [postId, username, navigate]);

  useEffect(() => {
    if (user) {
      console.log("🔴 Fetched user", user);
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          // console.log(decodedToken);
          setIsLoggedIn(true);
          setIsOwner(decodedToken.userName === username); // Check if current user is the owner

          // Fetch follow status
          const checkFollowStatus = async () => {
            try {
              const response = await fetch(
                `${BACKEND_URL}/api/user/${user._id}/is-following`,
                { headers: headers }
              );

              if (response.ok) {
                const { isFollowing } = await response.json();
                setIsFollowing(isFollowing);
              } else {
                setIsFollowing(false);
              }
            } catch (error) {
              console.error("Error checking follow status:", error);
            }
          };
          checkFollowStatus();
        } catch (error) {
          console.error("Error decoding token:", error);
          setIsLoggedIn(false);
        }
      }
    }
  }, [username, user]);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // If user is not found (404 error), render the NotFoundPage
  if (error === "User not found") {
    return <NotFoundPage />;
  }

  // If the data is still loading, you can display a loader or placeholder
  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <HeaderSidebarSwitch />
      <Profile isOwner={isOwner} user={user} handleLogOut={handleLogOut} />

      {postId && post && (
        <PostModal
          post={post}
          isOpen={true}
          onClose={() => {
            setPost(null);
            navigate(`/${username}`); // Close the modal and go back to profile
          }}
        />
      )}
    </>
  );
}

export default UserPage;
