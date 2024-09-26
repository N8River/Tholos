import "./userProfilePostCard.css";
import { useNavigate } from "react-router-dom";
import { RxDotsVertical } from "react-icons/rx";
import { useEffect, useState } from "react";
import { AUTH_HEADER, BACKEND_URL, JSON_HEADERS } from "../../config/config";
import EditPost from "../editPost/editPost";
import { jwtDecode } from "jwt-decode";
import LoginModal from "../loginModal/loginModal";

const token = localStorage.getItem("token");
const headers = token
  ? {
      ...JSON_HEADERS,
      ...AUTH_HEADER(token),
    }
  : {
      ...JSON_HEADERS,
    };

const decodedToken = token && jwtDecode(token);

function UserProfilePostCard({ post }) {
  const navigate = useNavigate();
  const [postOptionsVisible, setPostOptionsVisible] = useState(false);
  const [postDeleteConfirmationVisible, setPostDeleteConfirmationVisible] =
    useState(false);
  const [postEditVisible, setPostEditVisible] = useState(false);
  const [updatedPostContent, setUpdatedPostContent] = useState(post.content); // New state for post content
  const [isOwner, setIsOwner] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        if (decodedToken.userName === post.user.userName) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handlePostOptionsVisibility = () => {
    setPostOptionsVisible(true);

    setTimeout(() => {
      setPostOptionsVisible(false);
    }, 5000);
  };

  const handlePostDeleteConfirmationVisibility = () => {
    setPostDeleteConfirmationVisible(!postDeleteConfirmationVisible);
  };

  const handleEditPostVisibility = () => {
    setPostEditVisible(!postEditVisible);
  };

  const handleDeletePost = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/post/${post._id}/delete`,
        {
          method: "DELETE",
          headers: headers,
        }
      );

      if (response.ok) {
        // Handle UI update after deletion, e.g., remove the post from the list
        alert("Post deleted successfully");
        handlePostDeleteConfirmationVisibility();
      } else {
        throw new Error("Failed to delete post");
      }
    } catch (error) {
      console.log("Error deleting post:", error);
    }
  };

  const handleEditPost = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/post/${post._id}/edit`, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: updatedPostContent }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        alert("Post updated successfully");
        setPostEditVisible(false);
      } else {
        throw new Error("Failed to update post");
      }
    } catch (error) {
      console.log("Error updating post:", error);
    }
  };

  return (
    <>
      <div className="userProfilePostCard">
        <div className="userProfilePostCardImgWrapper">
          <img src={post.images[0]} alt={post.content} />
        </div>
        {isOwner ? (
          <>
            <div
              className="userPostOptionsBtn"
              onClick={() => {
                handlePostOptionsVisibility();
              }}
            >
              <RxDotsVertical />
            </div>
            <div
              className={`userPostOptionsDropdown ${
                postOptionsVisible ? "show" : ""
              }`}
            >
              <div className="editPostBtn" onClick={handleEditPostVisibility}>
                Edit Post
              </div>
              <div
                className="deletePostBtn"
                onClick={handlePostDeleteConfirmationVisibility}
              >
                Delete Post
              </div>
            </div>
            <div
              className="viewPostBtn"
              onClick={() => {
                navigate(`/${post.user.userName}/p/${post._id}`);
              }}
            >
              VIEW POST
            </div>
          </>
        ) : (
          <div
            className="viewPostBtn"
            onClick={() => {
              if (token) {
                navigate(`/${post.user.userName}/p/${post._id}`);
              } else {
                setShowPostModal(true);
              }
            }}
          >
            VIEW POST
          </div>
        )}
      </div>

      <div
        className={`deletePostConfirmation ${
          postDeleteConfirmationVisible ? "show" : ""
        }`}
      >
        <p>Are you sure you want to delete this post?</p>
        <div className="deletePostBtns">
          <button onClick={handleDeletePost}>Delete</button>
          <button onClick={handlePostDeleteConfirmationVisibility}>
            Go back
          </button>
        </div>
      </div>
      <div
        onClick={handlePostDeleteConfirmationVisibility}
        className={`postDeleteOverlay ${
          postDeleteConfirmationVisible ? "show" : ""
        }`}
      ></div>

      <EditPost
        isVisible={postEditVisible}
        post={post}
        updatedPostContent={updatedPostContent}
        setUpdatedPostContent={setUpdatedPostContent}
        handleEditPost={handleEditPost} // Pass the handler
        handleEditPostVisibility={handleEditPostVisibility}
      />

      {showPostModal && <LoginModal user={post.user} />}
    </>
  );
}

export default UserProfilePostCard;
