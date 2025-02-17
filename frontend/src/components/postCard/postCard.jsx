import { RxDotsVertical } from "react-icons/rx";
import { CiHeart } from "react-icons/ci";
import { VscComment } from "react-icons/vsc";
import { PiShareFatLight } from "react-icons/pi";
import { SlSizeFullscreen } from "react-icons/sl";
import { RiArrowLeftWideLine, RiArrowRightWideLine } from "react-icons/ri";
import { LuDot } from "react-icons/lu";
import { LiaHeart, LiaHeartSolid } from "react-icons/lia";
// import { LiaHeartSolid } from "react-icons/lia";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import "./postCard.css";
import { AUTH_HEADER, BACKEND_URL, JSON_HEADERS } from "../../config/config";
import { useEffect, useState } from "react";

import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

import { getAspectRatioClass, getRelativeTime } from "../../utils/utils";
import LoginModal from "../loginModal/loginModal";
import PostModal from "../postModal/postModal";
import useTokenVerification from "../../hooks/useTokenVerification";
import useTokenValidation from "../../hooks/useTokenVerification";

function PostCard({ post }) {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const {
    decodedToken,
    isValid,
    loading: tokenLoading,
  } = useTokenValidation(token);

  useEffect(() => {
    if (!tokenLoading) {
      if (!isValid) {
        localStorage.removeItem("token");
        navigate("/explore");
      }
    }
  }, [navigate, isValid, decodedToken, tokenLoading]);

  const headers = token
    ? {
        ...JSON_HEADERS,
        ...AUTH_HEADER(token),
      }
    : {
        ...JSON_HEADERS,
      };

  const [comments, setComments] = useState(post.comments.length);

  const [likes, setLikes] = useState(post.likes.length);
  const [hasLiked, setHasLiked] = useState(
    post.likes.includes(decodedToken?.userId)
  );

  useEffect(() => {
    if (!tokenLoading && decodedToken) {
      setHasLiked(post.likes.includes(decodedToken.userId));
    }
  }, [decodedToken, tokenLoading, post.likes]);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!tokenLoading && decodedToken) {
      checkHasLiked();
    }
  }, [tokenLoading, decodedToken]);

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
      setShowPostModal(true);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/post/${post._id}/like`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ postId: post._id }),
      });

      if (!response.ok) throw new Error("Failed to like/dislike the post");

      const responseData = await response.json();
      setHasLiked(!hasLiked);
      setLikes(responseData.likes);
    } catch (error) {
      console.log("Error liking/disliking the post:", error);
    }
  };

  const checkHasLiked = () => {
    // Ensure decodedToken and token are valid before checking
    if (
      !tokenLoading &&
      token &&
      decodedToken &&
      post.likes.includes(decodedToken.userId)
    ) {
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
            <LuDot />
            <small className="postCardTimestamp">
              {getRelativeTime(post.createdAt)}
            </small>
          </div>
          {/* <div className="postCardTimestamp">
            <small>{getRelativeTime(post.createdAt)}</small>
          </div> */}
          <div
            className="postMenuBtn"
            onClick={() => {
              handleOpenPostModal();
            }}
          >
            <SlSizeFullscreen />
          </div>
        </div>

        <div className="postImages">
          {post.images.length > 1 ? (
            <Carousel
              showThumbs={false}
              infiniteLoop={true}
              showStatus={false}
              renderArrowPrev={(clickHandler, hasPrev, label) =>
                hasPrev && (
                  <button
                    type="button"
                    onClick={clickHandler}
                    className="custom-prev-arrow"
                  >
                    <RiArrowLeftWideLine />
                  </button>
                )
              }
              renderArrowNext={(clickHandler, hasNext, label) =>
                hasNext && (
                  <button
                    type="button"
                    onClick={clickHandler}
                    className="custom-next-arrow"
                  >
                    <RiArrowRightWideLine />
                  </button>
                )
              }
            >
              {post.images.map((image, index) => (
                <div key={index} className="postImagesWrapper">
                  <img
                    src={image}
                    alt={`Post Image ${index + 1}`}
                    onLoad={(e) => {
                      const width = e.target.naturalWidth;
                      const height = e.target.naturalHeight;
                      console.log(`Image:`, width, height);
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
                  // console.log(`Single Image:`, width, height);
                  const aspectRatioClass = getAspectRatioClass(width, height);
                  // console.log("Aspect ratio class:", aspectRatioClass);
                  e.target.parentNode.classList.add(aspectRatioClass);
                }}
              />
            </div>
          )}
        </div>

        <div className="postToolBar">
          <div className="postLikeBtn" onClick={handleToggleLike}>
            {hasLiked ? (
              <LiaHeartSolid className="liked" key="liked" />
            ) : (
              <LiaHeart className="unliked" key="unliked" />
            )}
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
          {post.content}
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
          likes={likes}
          setLikes={setLikes} // Only from feed
          hasLiked={hasLiked}
          setHasLiked={setHasLiked}
        />
      )}

      {showLoginModal && (
        <LoginModal user={post.user} onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}

export default PostCard;
