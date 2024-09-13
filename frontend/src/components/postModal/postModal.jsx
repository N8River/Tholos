import "./postModal.css";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { AUTH_HEADER, BACKEND_URL, JSON_HEADERS } from "../../config/config";
import { useEffect, useState } from "react";
import { CiHeart } from "react-icons/ci";
import { VscComment } from "react-icons/vsc";
import { PiShareFatLight } from "react-icons/pi";
import Comment from "../comment/comment";

function PostModal({ post, isOpen, onClose }) {
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState(post.comments || []);

  const location = useLocation();

  const navigate = useNavigate();

  if (!isOpen) return null; // If the modal is not open, return nothing

  const token = localStorage.getItem("token");
  const [likes, setLikes] = useState(post.likes.length);
  const [hasLiked, setHasLiked] = useState(post.likes.includes(token.userId));
  const headers = {
    ...JSON_HEADERS,
    ...AUTH_HEADER(token),
  };

  const handleCommentSubmit = async () => {
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
      console.log("🔴 comments", comments);

      setCommentInput("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleToggleLike = async () => {
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

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen]);

  return (
    <>
      <div className="modalOverlay" onClick={onClose}>
        <IoMdClose />
      </div>
      <div className="postModal">
        <div className="postModalLeft">
          <div className="postModalImgWrapper">
            <img src={post.image} alt={post.content} />
          </div>
        </div>
        <div className="postModalRight">
          <div className="postModalUserAndCaption">
            <div className="postModalUserAvatar">
              <img src={post.user.avatar} alt="" />
            </div>
            <strong>{post.user.userName}</strong>
            <p>{post.content}</p>
          </div>
          <div className="postModalCommentBox">
            <div className="postModalCommentsList">
              {comments.length > 0 ? (
                comments.map((c, index) => {
                  // return console.log("🔴 C", c);
                  return <Comment comment={c} key={c._id} />;
                })
              ) : (
                <p>No comments on this post yet</p>
              )}
            </div>
          </div>
          <div className="postModalFooter">
            <div className="postToolBar">
              <div className="postLikeBtn" onClick={handleToggleLike}>
                <CiHeart className={hasLiked ? "liked" : ""} />
              </div>
              <div
                className="postCommentBtn"
                onClick={() => {
                  onCommentClick(post);
                }}
              >
                <VscComment />
              </div>
              <div className="postShareBtn" onClick={handleShare}>
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
            <div className="postModalCommentsInput">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
              />
              <button onClick={handleCommentSubmit}>Post</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PostModal;
