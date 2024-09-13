import useUserInfo from "../../hooks/useUserInfo";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { JSON_HEADERS, BACKEND_URL, AUTH_HEADER } from "../../config/config";
import { jwtDecode } from "jwt-decode";
import "./UserPage.css";
import SideBar from "../../components/sideBar/sideBar";
import HeaderSidebarSwitch from "../../components/headerSidebarSwitch/headerSidebarSwitch";
import Profile from "../../components/profile/profile";
import PostModal from "../../components/postModal/postModal";

function UserPage() {
  const { username, postId } = useParams();

  const userInfo = useUserInfo(username);

  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [isOwner, setIsOwner] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/api/post/${postId}`, {
            method: "GET",
            headers: JSON_HEADERS,
          });
          const data = await response.json();
          setPost(data);
        } catch (error) {
          console.error("Error fetching post:", error);
        }
      };

      fetchPost();
    }
  }, [postId]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (userInfo) {
      setUser(userInfo);
    }

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log(decodedToken);
        setIsLoggedIn(true);

        // Checking if the logged-in user is the owner of the profile
        if (decodedToken.userName === username) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsLoggedIn(false);
      }
    }
  }, [username, userInfo]);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

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
