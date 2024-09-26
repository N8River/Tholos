import { useEffect, useState } from "react";
import HeaderSidebarSwitch from "../../components/headerSidebarSwitch/headerSidebarSwitch";
import { JSON_HEADERS, AUTH_HEADER, BACKEND_URL } from "../../config/config";
import PostCard from "../../components/postCard/postCard";
import Feed from "../../components/feed/feed";
import Loader from "../../components/loader/loader";
import LoginModal from "../../components/loginModal/loginModal";

const token = localStorage.getItem("token");
const headers = {
  ...JSON_HEADERS,
  ...AUTH_HEADER(token),
};

function ExplorePage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1); // Current page for pagination
  const limit = 10; // Number of posts per page
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [selectedPost, setSelectedPost] = useState(null);

  const fetchPosts = async () => {
    if (isFetching || !hasMore) return;

    setIsFetching(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/post/explore?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const responseData = await response.json();
      console.log("🔴 Explore Posts:", responseData);

      if (responseData.length < limit) {
        setHasMore(false);
      }

      // Check if there are any new posts to append
      setPosts((prevPosts) => {
        const newPosts = responseData.filter(
          (post) => !prevPosts.find((prevPost) => prevPost._id === post._id)
        );
        return [...prevPosts, ...newPosts];
      });
    } catch (error) {
      console.log("Error fetching posts:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const loadMorePosts = () => {
    setPage((prevPage) => prevPage + 1);
  };

  return (
    <>
      {/* <LoginModal user={{avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRt5GtrRXAMhUA-UZy1Cg3gpBeYREtLjVWCjA&s', userName: 'BEENUS'}}/> */}
      <HeaderSidebarSwitch />
      <div className="exploreFeed">
        {/* Show Loader when isFetching is true, otherwise show the feed */}
        {isFetching && page === 1 ? (
          <Loader /> // Show loader initially
        ) : (
          <Feed posts={posts} loadMorePosts={loadMorePosts} />
        )}

        {/* Show Loader at the bottom when loading more posts */}
        {isFetching && page > 1 && <Loader />}
      </div>
    </>
  );
}

export default ExplorePage;
