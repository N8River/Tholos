import { GoHome, GoPlusCircle, GoSearch, GoBell } from "react-icons/go";
import { MdOutlineMessage } from "react-icons/md";
import { JSON_HEADERS, AUTH_HEADER, BACKEND_URL } from "../../config/config";
import io from "socket.io-client";

import { HiOutlineBuildingLibrary } from "react-icons/hi2";

import { useEffect, useState } from "react";

import "./SideBar.css";
import { useNavigate } from "react-router-dom";
import CreatePost from "../createPost/createPost";
import NotificationComponent from "../notificationComponent/notificationComponent";
import { jwtDecode } from "jwt-decode";
import { MdOutlineExplore } from "react-icons/md";
import SearchSidebar from "../searchSidebar/searchSidebar";

const token = localStorage.getItem("token");
const userId = token ? jwtDecode(token).userId : null;
const socket = io(BACKEND_URL, {
  query: { userId },
});

function SideBar({ user }) {
  const navigate = useNavigate();

  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const [showSearchSidebar, setShowSearchSidebar] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const headers = {
    ...JSON_HEADERS,
    ...AUTH_HEADER(token),
  };

  const handleCreatePostVisibilty = () => {
    setCreatePostVisible(!createPostVisible);
  };

  const handleNotificationDropdown = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
  };

  const handleSearchSidebarVisibility = () => {
    setShowSearchSidebar(!showSearchSidebar);
  };

  useEffect(() => {
    const userId = user._id;

    // Connect to socket with userId
    socket.emit("joinRoom", { userId });

    // Fetch unread notifications on mount
    const fetchUnreadNotifications = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/notification/unread`, {
          headers,
        });
        const data = await response.json();
        setUnreadCount(data.length); // Set unread count immediately
      } catch (error) {
        console.error("Error fetching unread notifications:", error);
      }
    };

    fetchUnreadNotifications();

    // Listen for real-time notifications
    socket.on("notification", (notification) => {
      console.log("Received new notification:", notification);
      setUnreadCount((prevCount) => prevCount + 1); // Increase the unread count dynamically
    });

    return () => {
      socket.off("notification");
    };
  }, [user._id]); // Include userId as dependency

  return (
    <>
      <div className="sideBar">
        {!showSearchSidebar ? (
          <div className="logo">Tholos.</div>
        ) : (
          <div className="logoIcon">
            <HiOutlineBuildingLibrary />
          </div>
        )}
        <div
          className="home sidebarBtn"
          onClick={() => {
            navigate("/");
          }}
        >
          <GoHome />
          <big>Home</big>
        </div>
        <div
          className="search sidebarBtn"
          onClick={handleSearchSidebarVisibility}
        >
          <GoSearch />
          <big>Search</big>
        </div>
        <div className="create sidebarBtn" onClick={handleCreatePostVisibilty}>
          <GoPlusCircle />
          <big>Create</big>
        </div>

        <div
          className="explore sidebarBtn"
          onClick={() => {
            navigate("/explore");
          }}
        >
          <MdOutlineExplore />
          <big>Explore</big>
        </div>

        <div
          className="messages sidebarBtn"
          onClick={() => {
            navigate("/messages");
          }}
        >
          <MdOutlineMessage />
          <big>Messages</big>
        </div>

        {/* Notification button with unread count */}
        <div
          className="notification sidebarBtn"
          onClick={handleNotificationDropdown}
        >
          <div>
            <GoBell />
            {unreadCount > 0 && (
              <span className="notificationCount">{unreadCount}</span>
            )}{" "}
            {/* Show unread count */}
            <big>Notifications</big>
          </div>

          {showNotificationDropdown && (
            <div
              className={
                showNotificationDropdown === true
                  ? "notificationDropdown show"
                  : "notificationDropdown"
              }
            >
              <NotificationComponent setUnreadCount={setUnreadCount} />
            </div>
          )}
        </div>

        <div
          className="profileBtn sidebarBtn"
          onClick={() => {
            navigate(`/${user.userName}`);
          }}
        >
          <div className="imgWrapper">
            <img src={user.avatar} alt="" />
          </div>
          <big>Profile</big>
        </div>
      </div>
      <SearchSidebar isVisible={showSearchSidebar} />
      <CreatePost
        isVisible={createPostVisible}
        handleCreatePostVisibilty={handleCreatePostVisibilty}
      />
    </>
  );
}

export default SideBar;
