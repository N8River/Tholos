import { useEffect, useState } from "react";
import { AUTH_HEADER, BACKEND_URL, JSON_HEADERS } from "../../config/config";
import PostCard from "../postCard/postCard";
import PostModal from "../postModal/postModal";
import LoginModal from "../loginModal/loginModal";

import "./feed.css";

function Feed({ posts, loadMorePosts }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const token = localStorage.getItem("token");

  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 1
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
  };

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
