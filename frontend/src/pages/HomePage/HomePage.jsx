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
import { isTokenExpired } from "../../utils/utils";
import "./HomePage.css";
import { MdOutlineRefresh } from "react-icons/md";
import { useLocation } from "react-router-dom";
import useResponsive from "../../hooks/useResponsive";
import useTokenVerification from "../../hooks/useTokenVerification";
import useTokenValidation from "../../hooks/useTokenVerification";

function HomePage() {
  const token = localStorage.getItem("token");

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1); // Current page for pagination
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // Number of posts per page

  const navigate = useNavigate();
  const isMobile = useResponsive(1280);

  const { isValid, loading: tokenLoading } = useTokenValidation(token);

  useEffect(() => {
    if (!token) {
      navigate("/explore");
    }

    if (!isValid && !tokenLoading) {
      localStorage.removeItem("token");
      navigate("/explore");
    }
  }, [isValid, navigate, tokenLoading]);

  // useEffect(() => {
  //   if (token && isTokenExpired(token)) {
  //     // Token is expired or invalid
  //     localStorage.removeItem("token");
  //     navigate("/");
  //     window.location.reload(); // Refresh to load the page as an anonymous user
  //   }
  // }, [navigate, token]);

  const headers = {
    ...JSON_HEADERS,
    ...AUTH_HEADER(token),
  };

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
      console.log("⚔️⚔️", responseData);

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
    if (!tokenLoading && token && isValid) {
      fetchPosts();
    }
  }, [page, tokenLoading, token, isValid]);

  const loadMorePosts = () => {
    setPage((prevPage) => prevPage + 1); // Increment page to load more posts
  };

  return (
    <>
      <HeaderSidebarSwitch />
      {token && <FriendsHeader />}

      {isFetching && posts.length === 0 ? ( // If fetching and no posts, show full page loader
        <Loader />
      ) : (
        <>
          {posts.length === 0 ? ( // Check if there are no posts and show a message
            <div className="noPostsMessage">
              <div className="followPeopleRefreshMessageWrapper">
                <p className="followPeopleRefreshMessage">
                  Follow some people and refresh to see posts in your feed!
                </p>
              </div>
              <button
                className="refreshBtn"
                onClick={() => window.location.reload()}
              >
                Refresh feed <MdOutlineRefresh />
              </button>
              {token && <FollowSuggestion noFollowing={true} />}
              {/* Show follow suggestions */}
            </div>
          ) : (
            <>
              <Feed posts={posts} loadMorePosts={loadMorePosts} />
              {isFetching && <Loader />}
              {!isMobile && token && <FollowSuggestion />}
            </>
          )}
        </>
      )}
    </>
  );
}

export default HomePage;
