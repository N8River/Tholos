import { useEffect, useState } from "react";
import { AUTH_HEADER, BACKEND_URL, JSON_HEADERS } from "../../config/config";
import PostCard from "../postCard/postCard";
import PostModal from "../postModal/postModal";

import "./feed.css";

function Feed({ posts }) {
  // const [posts, setPosts] = useState();
  const [selectedPost, setSelectedPost] = useState(null);

  // const token = localStorage.getItem("token");

  // const headers = {
  //   ...JSON_HEADERS,
  //   ...AUTH_HEADER(token),
  // };

  // useEffect(() => {
  //   const fetchPosts = async () => {
  //     try {
  //       const response = await fetch(`${BACKEND_URL}/api/post/discover`, {
  //         method: "GET",
  //         headers: headers,
  //       });

  //       if (!response.ok) {
  //         throw new Error("Failed to fetch posts");
  //       }

  //       const responseData = await response.json();
  //       console.log(responseData);
  //       setPosts(responseData);
  //     } catch (error) {
  //       console.log("Error fetching posts:", error);
  //     }
  //   };

  //   fetchPosts();
  // }, []);

  const handleOpenModal = (post) => {
    setSelectedPost(post); // Set the selected post for the modal
  };

  const handleCloseModal = () => {
    setSelectedPost(null); // Close the modal by resetting the selected post
  };

  return (
    <>
      <div className="feed">
        <div className="postList">
          {posts &&
            posts.map((post, index) => {
              return (
                <PostCard
                  post={post}
                  key={post._id}
                  onCommentClick={handleOpenModal}
                />
              );
            })}
        </div>
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default Feed;
