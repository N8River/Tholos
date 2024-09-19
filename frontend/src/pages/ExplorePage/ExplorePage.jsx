import { useEffect, useState } from "react";
import HeaderSidebarSwitch from "../../components/headerSidebarSwitch/headerSidebarSwitch";
import { JSON_HEADERS, AUTH_HEADER, BACKEND_URL } from "../../config/config";
import PostCard from "../../components/postCard/postCard";
import Feed from "../../components/feed/feed";

const token = localStorage.getItem("token");
const headers = {
  ...JSON_HEADERS,
  ...AUTH_HEADER(token),
};

function ExplorePage() {
  const [posts, setPosts] = useState();
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/post/explore`, {
          method: "GET",
          headers: headers,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const responseData = await response.json();
        console.log("🔴 Explore Posts:", responseData);
        setPosts(responseData);
      } catch (error) {
        console.log("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <>
      <HeaderSidebarSwitch />
      <div className="exploreFeed">
        <Feed posts={posts} />
      </div>
    </>
  );
}

export default ExplorePage;
