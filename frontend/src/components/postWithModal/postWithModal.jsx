import { useParams } from "react-router-dom";
import PostModal from "../postModal/postModal";
import { useState, useEffect } from "react";
import { BACKEND_URL, JSON_HEADERS } from "../../config/config";
import UserPage from "../../pages/UserPage/UserPage";

function PostWithModal() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
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
  }, [postId]);

  return (
    <>
      <UserPage />

      {post && <PostModal post={post} isOpen={true} onClose={() => {}} />}
    </>
  );
}

export default PostWithModal;
