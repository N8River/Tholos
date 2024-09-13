import { RxDotsVertical } from "react-icons/rx";
import { CiHeart } from "react-icons/ci";
import { VscComment } from "react-icons/vsc";
import { PiShareFatLight } from "react-icons/pi";

import "./postCard.css";
import { AUTH_HEADER, BACKEND_URL, JSON_HEADERS } from "../../config/config";
import { useState } from "react";
import PostModal from "../postModal/postModal";

function PostCard({ post, onCommentClick }) {
  console.log(post);

  const token = localStorage.getItem("token");

  const headers = {
    ...JSON_HEADERS,
    ...AUTH_HEADER(token),
  };

  const [likes, setLikes] = useState(post.likes.length);
  const [comments, setComments] = useState(post.comments.length);
  const [hasLiked, setHasLiked] = useState(post.likes.includes(token.userId));
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleOpenComments = async () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="postCard">
        <div className="postCardHeader">
          <div className="postUserInfo">
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
          <div className="postImagesWrapper">
            <img src={post.image} alt="" />
          </div>
        </div>
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
        <div
          className="commentInteractions"
          onClick={() => {
            onCommentClick(post);
          }}
        >
          {comments === 0 ? (
            <small>Be the first one to comment</small>
          ) : comments === 1 ? (
            <small>View {comments} comment</small>
          ) : (
            <small>View all {comments} comments</small>
          )}
        </div>
      </div>
    </>
  );
}

export default PostCard;
