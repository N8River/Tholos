import { RxDotsVertical } from "react-icons/rx";
import { CiHeart } from "react-icons/ci";
import { VscComment } from "react-icons/vsc";
import { PiShareFatLight } from "react-icons/pi";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import "./postCard.css";
import { AUTH_HEADER, BACKEND_URL, JSON_HEADERS } from "../../config/config";
import { useEffect, useState } from "react";

import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

import { getAspectRatioClass } from "../../utils/utils";
import LoginModal from "../loginModal/loginModal";
import PostModal from "../postModal/postModal";

function PostCard({ post }) {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const decodedToken = token && jwtDecode(token);

  const headers = token
    ? {
        ...JSON_HEADERS,
        ...AUTH_HEADER(token),
      }
    : {
        ...JSON_HEADERS,
      };

  const [likes, setLikes] = useState(post.likes.length);
  const [comments, setComments] = useState(post.comments.length);
  const [hasLiked, setHasLiked] = useState(
    token ? post.likes.includes(token.userId) : false
  );
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    checkHasLiked();
  }, []);

  useEffect(() => {
    if (showLoginModal) {
      // Disable scrolling when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Enable scrolling when modal is closed
      document.body.style.overflow = "auto";
    }

    // Clean up when the component unmounts
    return () => {
      document.body.style.overflow = "auto"; // Enable scrolling again
    };
  }, [showLoginModal]);

  const handleToggleLike = async () => {
    if (!token) {
      setShowLoginModal(true);
      console.log("☄️☄️☄️☄️☄️☄️");

      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/post/${post._id}/like`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          postId: post._id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to like/dislike the post");
      }

      const responseData = await response.json();
      console.log(responseData);

      setHasLiked(!hasLiked);
      setLikes(responseData.likes);
    } catch (error) {
      console.log("Error liking/disliking the post:", error);
    }
  };

  const checkHasLiked = () => {
    if (token && post.likes.includes(decodedToken.userId)) {
      setHasLiked(true);
    } else {
      setHasLiked(false);
    }
  };

  const handleOpenPostModal = () => {
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    setIsPostModalOpen(true);
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
  };

  return (
    <>
      <div className="postCard">
        <div className="postCardHeader">
          <div
            className="postUserInfo"
            onClick={() => {
              navigate(`/${post.user.userName}`);
            }}
          >
            <div className="postUserAvatar">
              <img src={post.user.avatar} alt="" />
            </div>
            <div className="postUserName">{post.user.userName}</div>
          </div>
          <div className="postMenuBtn">
            <RxDotsVertical />
          </div>
        </div>

        <div className="postImages">
          {post.images.length > 1 ? (
            <Carousel showThumbs={false} infiniteLoop={true} showStatus={false}>
              {post.images.map((image, index) => (
                <div key={index} className="postImagesWrapper">
                  <img
                    src={image}
                    alt={`Post Image ${index + 1}`}
                    onLoad={(e) => {
                      const width = e.target.naturalWidth;
                      const height = e.target.naturalHeight;
                      console.log(`Image ${index + 1}:`, width, height);
                      const aspectRatioClass = getAspectRatioClass(
                        width,
                        height
                      );
                      console.log("Aspect ratio class:", aspectRatioClass);
                      e.target.parentNode.classList.add(aspectRatioClass);
                    }}
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="postImagesWrapper">
              <img
                src={post.images[0]}
                alt="Post Image"
                onLoad={(e) => {
                  const width = e.target.naturalWidth;
                  const height = e.target.naturalHeight;
                  console.log(`Single Image:`, width, height);
                  const aspectRatioClass = getAspectRatioClass(width, height);
                  console.log("Aspect ratio class:", aspectRatioClass);
                  e.target.parentNode.classList.add(aspectRatioClass);
                }}
              />
            </div>
          )}
        </div>

        <div className="postToolBar">
          <div className="postLikeBtn" onClick={handleToggleLike}>
            <CiHeart className={hasLiked ? "liked" : ""} />
          </div>
          <div className="postCommentBtn" onClick={handleOpenPostModal}>
            <VscComment />
          </div>
          <div className="postShareBtn">
            <PiShareFatLight />
          </div>
        </div>
        <div className="likeInteractions">
          {likes === 0 ? (
            <small>No likes</small>
          ) : likes === 1 ? (
            <small> {likes} like</small>
          ) : (
            <small> {likes} likes</small>
          )}
        </div>
        <div className="postCaption">
          <strong className="postUsername">{post.user.userName}</strong>
          <span> {post.content}</span>
        </div>
        <div className="commentInteractions" onClick={handleOpenPostModal}>
          {comments === 0 ? (
            <small>Be the first one to comment</small>
          ) : comments === 1 ? (
            <small>View {comments} comment</small>
          ) : (
            <small>View all {comments} comments</small>
          )}
        </div>
      </div>

      {isPostModalOpen && (
        <PostModal
          post={post}
          isOpen={isPostModalOpen}
          onClose={handleClosePostModal}
        />
      )}

      {showLoginModal && (
        <LoginModal user={post.user} onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}

export default PostCard;
