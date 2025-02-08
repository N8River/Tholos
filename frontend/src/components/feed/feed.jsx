import { useEffect, useState } from "react";
import { AUTH_HEADER, BACKEND_URL, JSON_HEADERS } from "../../config/config";
import PostCard from "../postCard/postCard";
import PostModal from "../postModal/postModal";
import LoginModal from "../loginModal/loginModal";

import { useCallback } from "react";
import _ from "lodash";

import "./feed.css";
import useTokenVerification from "../../hooks/useTokenVerification";
import useTokenValidation from "../../hooks/useTokenVerification";
import { useNavigate } from "react-router-dom";

function Feed({ posts, loadMorePosts }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const token = localStorage.getItem("token");

  const { isValid, loading: tokenLoading } = useTokenValidation(token);

  const navigate = useNavigate();

  useEffect(() => {
    if (!tokenLoading) {
      if (!isValid && token) {
        localStorage.removeItem("token");
        navigate("/explore");
      }
    }
  }, [isValid, tokenLoading, navigate]);

  const handleScroll = useCallback(
    _.debounce(() => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 250
      ) {
        if (!token && !showLoginModal) {
          setShowLoginModal(true);
          document.body.style.overflow = "hidden"; // Disable scrolling when modal is shown
          return; // Stop further execution for anonymous users
        }

        // If the user is logged in, continue loading more posts
        if (token) {
          loadMorePosts();
        }
      }
    }, 300)
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showLoginModal]);

  return (
    <>
      <div className="feed">
        <div className="postList">
          {posts &&
            posts.map((post, index) => {
              return <PostCard post={post} key={post._id} />;
            })}
        </div>
      </div>

      {showLoginModal && <LoginModal />}
    </>
  );
}

export default Feed;
