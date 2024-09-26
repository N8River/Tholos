import { useEffect, useState } from "react";
import Feed from "../../components/feed/feed";
import Header from "../../components/header/header";
import HeaderSidebarSwitch from "../../components/headerSidebarSwitch/headerSidebarSwitch";
import SideBar from "../../components/sideBar/sideBar";
import { AUTH_HEADER, JSON_HEADERS, BACKEND_URL } from "../../config/config";
import FriendsHeader from "../../components/friendsHeader/friendsHeader";
import FollowSuggestion from "../../components/followSuggestion/followSuggestion";
import Loader from "../../components/loader/loader";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const token = localStorage.getItem("token");
  const headers = {
    ...JSON_HEADERS,
    ...AUTH_HEADER(token),
  };
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1); // Current page for pagination
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // Number of posts per page

  const navigate = useNavigate();

  useEffect(() => {
    // If there is no token, redirect to /explore
    if (!token) {
      navigate("/explore");
    }
  }, [navigate]);

  const fetchPosts = async () => {
    if (isFetching || !hasMore) return;

    setIsFetching(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/post/following-feed?page=${page}&limit=${limit}`, // Add page and limit to the request
        {
          method: "GET",
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const responseData = await response.json();
      console.log(responseData);

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
    setPage((prevPage) => prevPage + 1); // Increment page to load more posts
  };

  return (
    <>
      <HeaderSidebarSwitch />
      <FriendsHeader />
      {isFetching && posts.length === 0 ? ( // If fetching and no posts, show full page loader
        <Loader />
      ) : (
        <>
          <Feed posts={posts} loadMorePosts={loadMorePosts} />
          {isFetching && <Loader />} <FollowSuggestion />
        </>
      )}
    </>
  );
}

export default HomePage;
