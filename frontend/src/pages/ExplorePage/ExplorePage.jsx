import { useEffect, useState } from "react";
import HeaderSidebarSwitch from "../../components/headerSidebarSwitch/headerSidebarSwitch";
import { JSON_HEADERS, AUTH_HEADER, BACKEND_URL } from "../../config/config";

import Feed from "../../components/feed/feed";
import Loader from "../../components/loader/loader";

import { isTokenExpired } from "../../utils/utils";
import { useNavigate } from "react-router-dom";
import useTokenVerification from "../../hooks/useTokenVerification";
import useTokenValidation from "../../hooks/useTokenVerification";

function ExplorePage() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const { isValid, loading: tokenLoading } = useTokenValidation(token);

  useEffect(() => {
    if (!tokenLoading && !isValid && token) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate, isValid, tokenLoading]);

  const headers = {
    ...JSON_HEADERS,
    ...AUTH_HEADER(token),
  };

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1); // Current page for pagination
  const limit = 10; // Number of posts per page
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      // Token is expired or invalid
      localStorage.removeItem("token");
      navigate("/explore");
      window.location.reload(); // Refresh to load the page as an anonymous user
    }
  }, [navigate, token]);

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
      <HeaderSidebarSwitch />
      <div className="exploreFeed">
        {/* Show Loader when isFetching is true, otherwise show the feed */}
        {(isFetching || tokenLoading) && page === 1 ? (
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
