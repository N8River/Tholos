import { useEffect, useState } from "react";
import Feed from "../../components/feed/feed";
import Header from "../../components/header/header";
import HeaderSidebarSwitch from "../../components/headerSidebarSwitch/headerSidebarSwitch";
import SideBar from "../../components/sideBar/sideBar";
import { AUTH_HEADER, JSON_HEADERS, BACKEND_URL } from "../../config/config";
import FriendsHeader from "../../components/friendsHeader/friendsHeader";
import FollowSuggestion from "../../components/followSuggestion/followSuggestion";

const token = localStorage.getItem("token");
const headers = {
  ...JSON_HEADERS,
  ...AUTH_HEADER(token),
};

function HomePage() {
  const [posts, setPosts] = useState();
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/post/following-feed`, {
          method: "GET",
          headers: headers,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const responseData = await response.json();
        console.log(responseData);
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
      <FriendsHeader />
      <Feed posts={posts} />
      <FollowSuggestion />
    </>
  );
}

export default HomePage;
