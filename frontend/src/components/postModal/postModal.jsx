import "./postModal.css";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import {
  AUTH_HEADER,
  BACKEND_URL,
  JSON_HEADERS,
  MAX_COMMENT_SIZE,
} from "../../config/config";
import { useEffect, useState } from "react";
import { CiHeart } from "react-icons/ci";
import { VscComment } from "react-icons/vsc";
import { PiShareFatLight } from "react-icons/pi";
import { IoIosArrowBack } from "react-icons/io";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { RiArrowLeftWideLine, RiArrowRightWideLine } from "react-icons/ri";
import Comment from "../comment/comment";
import { LiaHeart, LiaHeartSolid } from "react-icons/lia";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import { getAspectRatioClass, getRelativeTime } from "../../utils/utils";
import LoginModal from "../loginModal/loginModal";
import { jwtDecode } from "jwt-decode";

import { useRef } from "react";

import useResponsive from "../../hooks/useResponsive";

import useTokenValidation from "../../hooks/useTokenVerification";

function PostModal({
  post,
  isOpen,
  onClose,
  likes,
  setLikes,
  hasLiked,
  setHasLiked,
}) {
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCommentBoxMobile, setShowCommentBoxMobile] = useState(false);

  const commentInputRef = useRef(null);

  const isMobile = useResponsive(1025);

  const location = useLocation();

  const navigate = useNavigate();

  if (!isOpen) return null; // If the modal is not open, return nothing

  const token = localStorage.getItem("token");

  const {
    decodedToken,
    isValid,
    loading: tokenLoading,
  } = useTokenValidation(token);

  useEffect(() => {
    if (!tokenLoading && !isValid) {
      localStorage.removeItem("token");
      navigate("/explore");
    }
  }, [navigate, isValid, decodedToken, tokenLoading]);

  const [localLikes, setLocalLikes] = useState(post.likes.length);
  const [localHasLiked, setLocalHasLiked] = useState(
    post.likes.includes(jwtDecode(token)?.userId)
  );

  // These are the "effective" states we'll use for rendering:
  const currentLikes = typeof likes === "number" ? likes : localLikes;
  const currentHasLiked =
    typeof hasLiked === "boolean" ? hasLiked : localHasLiked;

  useEffect(() => {
    // Update local state when post.likes changes.
    setLocalHasLiked(post.likes.includes(jwtDecode(token)?.userId));
    setLocalLikes(post.likes.length);
  }, [post.likes, token]);

  useEffect(() => {
    checkHasLiked(); // Sync like state when post modal opens
  }, [isOpen, post.likes]); // Remove `decodedToken` to prevent excessive re-renders

  const headers = token
    ? {
        ...JSON_HEADERS,
        ...AUTH_HEADER(token),
      }
    : {
        ...JSON_HEADERS,
      };

  const handleCommentSubmit = async () => {
    if (!token) {
      setShowPostModal(true);
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/post/${post._id}/comment`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            comment: commentInput,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const responseData = await response.json();

      setComments([...comments, responseData.comment]);

      setCommentInput("");
    } catch (error) {
      console.log(error);
    }
  };

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
      // Toggle the like state:
      if (setHasLiked && setLikes) {
        // Update parent state if available.
        setHasLiked((prev) => !prev);
        setLikes(responseData.likes);
      } else {
        // Otherwise, update local state.
        setLocalHasLiked((prev) => !prev);
        setLocalLikes(responseData.likes);
      }
    } catch (error) {
      console.log("Error liking/disliking the post:", error);
    }
  };

  const handleShare = () => {
    const username = post.user.userName;
    const shareUrl = `${window.location.origin}/${username}/p/${post._id}`;

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => alert("Link copied to clipboard!"))
      .catch((error) => console.error("Failed to copy link:", error));
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/post/${post._id}/comment`,
        {
          method: "GET",
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const focusCommentInput = () => {
    commentInputRef.current?.focus();
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen]);

  const checkHasLiked = () => {
    if (!tokenLoading && decodedToken) {
      console.log("👹", decodedToken.userId);
      const isLiked = post.likes.includes(decodedToken.userId);
      setLocalHasLiked(isLiked);
      setLocalLikes(post.likes.length);

      // Sync with PostCard if available
      if (setHasLiked) setHasLiked(isLiked);
      if (setLikes) setLikes(post.likes.length);
    }
  };

  return (
    <>
      <div className="modalOverlay" onClick={onClose}>
        <IoMdClose />
      </div>

      {isMobile ? (
        <div className="postModal-mobile">
          <div className="postModal-mobile-image">
            {post.images.length > 1 ? (
              <Carousel
                showThumbs={false}
                infiniteLoop={true}
                showStatus={false}
              >
                {post.images.map((image, index) => (
                  <div className="postImagesWrapper-mobile">
                    <img
                      src={image}
                      alt={`Post Image ${index + 1}`}
                      onLoad={(e) => {
                        const width = e.target.naturalWidth;
                        const height = e.target.naturalHeight;
                        const aspectRatioClass = getAspectRatioClass(
                          width,
                          height
                        );
                        e.target.parentNode.classList.add(aspectRatioClass);
                      }}
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="postImagesWrapper-mobile">
                <img
                  src={post.images[0]}
                  alt={post.content}
                  onLoad={(e) => {
                    const width = e.target.naturalWidth;
                    const height = e.target.naturalHeight;
                    const aspectRatioClass = getAspectRatioClass(width, height);
                    e.target.parentNode.classList.add(aspectRatioClass); // Add class based on aspect ratio
                  }}
                />
              </div>
            )}
          </div>
          <div className="postModal-mobile-toolbar">
            <div className="postModalUserAndCaption-mobile">
              <div className="postModalUserAvatar-mobile">
                <img src={post.user.avatar} alt="" />
              </div>
              <div className="postModalCaption-mobile">
                <strong>{post.user.userName}</strong>
                {post.content}
              </div>
            </div>
            <div
              className={`postModalCommentBox-mobile ${
                showCommentBoxMobile ? "show" : ""
              }`}
            >
              <div className="postModalCommentBox-mobile-header">
                <IoIosArrowBack
                  onClick={() => {
                    setShowCommentBoxMobile(!showCommentBoxMobile);
                  }}
                />
                <p>COMMENTS</p>
              </div>
              {comments.length > 0 ? (
                <div className="postModalCommentsList-mobile">
                  {comments.length > 0 &&
                    comments.map((c, index) => {
                      // return console.log("🔴 C", c);
                      return <Comment comment={c} key={c._id} />;
                    })}
                </div>
              ) : (
                <p className="noCommentsYet-mobile">
                  No comments on this post yet
                </p>
              )}
            </div>
            <div className="postModalFooter-mobile">
              <div className="postToolBar-mobile">
                <div className="postLikeBtn-mobile" onClick={handleToggleLike}>
                  {currentHasLiked ? (
                    <LiaHeartSolid className="liked" key="liked" />
                  ) : (
                    <LiaHeart className="unliked" key="unliked" />
                  )}
                </div>
                <div
                  className="postCommentBtn-mobile"
                  onClick={() => {
                    focusCommentInput();
                    setShowCommentBoxMobile(!showCommentBoxMobile);
                  }}
                >
                  <VscComment />
                </div>
                <div className="postShareBtn-mobile" onClick={handleShare}>
                  <PiShareFatLight />
                </div>
              </div>
              <div className="likeInteractions-mobile">
                {currentLikes === 0 ? (
                  <small>No likes</small>
                ) : currentLikes === 1 ? (
                  <small>{currentLikes} like</small>
                ) : (
                  <small>{currentLikes} likes</small>
                )}
                <small className="postModalTimestamp-mobile">
                  Posted {getRelativeTime(post.createdAt)}
                </small>
              </div>
              <div className="postModalCommentsInput-mobile">
                <input
                  ref={commentInputRef}
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                />
                <button onClick={handleCommentSubmit}>Comment</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="postModal">
          <div className="postModalLeft">
            <div className="postModalImgWrapper">
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
                          const aspectRatioClass = getAspectRatioClass(
                            width,
                            height
                          );
                          e.target.parentNode.classList.add(aspectRatioClass); // Add class based on aspect ratio
                        }}
                      />
                    </div>
                  ))}
                </Carousel>
              ) : (
                <div className="postImagesWrapper">
                  <img
                    src={post.images[0]}
                    alt={post.content}
                    onLoad={(e) => {
                      const width = e.target.naturalWidth;
                      const height = e.target.naturalHeight;
                      const aspectRatioClass = getAspectRatioClass(
                        width,
                        height
                      );
                      e.target.parentNode.classList.add(aspectRatioClass); // Add class based on aspect ratio
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="postModalRight">
            <div className="postModalUserAndCaption">
              <div
                className="postModalUserAvatar"
                onClick={() => {
                  navigate(`/${post.user.userName}`);
                }}
              >
                <img src={post.user.avatar} alt="" />
              </div>
              <div className="inline-block">
                <strong
                  className="postModalUserNameText"
                  onClick={() => {
                    navigate(`/${post.user.userName}`);
                  }}
                >
                  {post.user.userName}
                </strong>
                {post.content}
              </div>
            </div>
            <div className="postModalCommentBox">
              {comments.length > 0 ? (
                <div className="postModalCommentsList">
                  {comments.length > 0 &&
                    comments.map((c, index) => {
                      // return console.log("🔴 C", c);
                      return <Comment comment={c} key={c._id} />;
                    })}
                </div>
              ) : (
                <p className="noCommentsYet">No comments on this post yet</p>
              )}
            </div>
            <div className="postModalFooter">
              <div className="postToolBar">
                <div className="postLikeBtn" onClick={handleToggleLike}>
                  {currentHasLiked ? (
                    <LiaHeartSolid className="liked" key="liked" />
                  ) : (
                    <LiaHeart className="unliked" key="unliked" />
                  )}
                </div>

                <div className="postCommentBtn" onClick={focusCommentInput}>
                  <VscComment />
                </div>
                <div className="postShareBtn" onClick={handleShare}>
                  <PiShareFatLight />
                </div>
              </div>
              <div className="likeInteractions">
                {currentLikes === 0 ? (
                  <small>No likes</small>
                ) : currentLikes === 1 ? (
                  <small>{currentLikes} like</small>
                ) : (
                  <small>{currentLikes} likes</small>
                )}
                <small className="postModalTimestamp">
                  Posted {getRelativeTime(post.createdAt)}
                </small>
              </div>

              <div className="postModalCommentsInput">
                <input
                  ref={commentInputRef}
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  maxLength={MAX_COMMENT_SIZE}
                />
                <button
                  className={`commentBtn ${
                    commentInput.length > 0 &&
                    commentInput.length <= MAX_COMMENT_SIZE
                      ? "active"
                      : "inactive"
                  }`}
                  disabled={
                    commentInput.length === 0 ||
                    commentInput.length > MAX_COMMENT_SIZE
                  }
                  onClick={handleCommentSubmit}
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPostModal && <LoginModal />}
    </>
  );
}

export default PostModal;
