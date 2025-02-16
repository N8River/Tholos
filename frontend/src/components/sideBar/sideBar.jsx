import { GoHome, GoPlusCircle, GoSearch, GoBell } from "react-icons/go";
import { IoIosSettings } from "react-icons/io";

import {
  MdOutlineMessage,
  MdDarkMode,
  MdOutlineLightMode,
} from "react-icons/md";
import { JSON_HEADERS, AUTH_HEADER, BACKEND_URL } from "../../config/config";
import io from "socket.io-client";

import { HiOutlineBuildingLibrary } from "react-icons/hi2";

import { useEffect, useState, useLayoutEffect } from "react";

import "./sideBar.css";
import { useLocation, useNavigate } from "react-router-dom";
import CreatePost from "../createPost/createPost";
import NotificationComponent from "../notificationComponent/notificationComponent";
import { jwtDecode } from "jwt-decode";
import { MdOutlineExplore } from "react-icons/md";
import SearchSidebar from "../searchSidebar/searchSidebar";
import { useFeedback } from "../../context/feedbackContext";
import { IoAlarm } from "react-icons/io5";
import NotificationSidebar from "../notificationSidebar/notificationSidebar";
import { TbLogout2 } from "react-icons/tb";

import useResponsive from "../../hooks/useResponsive";
import useTokenVerification from "../../hooks/useTokenVerification";
import useTokenValidation from "../../hooks/useTokenVerification";

function SideBar({ user }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const { isValid, loading: tokenLoading } = useTokenValidation(token);

  useEffect(() => {
    if (!isValid && !tokenLoading) {
      navigate("/explore");
      localStorage.removeItem("token");
    }
  }, [navigate, isValid, tokenLoading]);

  const userId = token ? jwtDecode(token).userId : null;
  const socket = io(BACKEND_URL, {
    query: { userId },
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  const location = useLocation();

  const { showFeedback } = useFeedback();

  const isMobile = useResponsive(768);

  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [showNotificationSidebar, setShowNotificationSidebar] = useState(false);
  const [searchSidebarVisibility, setSearchbarVisibility] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileSearchbarVisibility, setMobileSearchbarVisibility] =
    useState(false);

  const [showMobileNotificationSidebar, setShowMobileNotificationSidebar] =
    useState(false);

  const [settingsMobileVisibility, setSettingsMobileVisibility] =
    useState(false);

  const headers = {
    ...JSON_HEADERS,
    ...AUTH_HEADER(token),
  };

  const [sidebarIsCollapsed, setSidebarIsCollapsed] = useState(
    window.innerWidth <= 1280 // Initial state based on screen width
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1280) {
        setSidebarIsCollapsed(true);
      } else {
        setSidebarIsCollapsed(false);
      }
    };

    handleResize(); // Initial check on mount

    // Add event listener on mount
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!showNotificationSidebar && !searchSidebarVisibility) {
      // If both sidebars are closed, collapse on smaller screens
      setSidebarIsCollapsed(window.innerWidth <= 1280);
    }
  }, [showNotificationSidebar, searchSidebarVisibility]);

  const handleCreatePostVisibilty = () => {
    setCreatePostVisible(!createPostVisible);
  };

  const handleNotificationSidebar = () => {
    if (searchSidebarVisibility) {
      setSearchbarVisibility(false);
      setShowNotificationSidebar(true);
    } else {
      setShowNotificationSidebar(!showNotificationSidebar);
      setSidebarIsCollapsed(!sidebarIsCollapsed);
    }
  };

  const handleSearchSidebarVisibility = () => {
    if (showNotificationSidebar) {
      setShowNotificationSidebar(false);
      setSearchbarVisibility(true);
    } else {
      setSearchbarVisibility(!searchSidebarVisibility);
      setSidebarIsCollapsed(!sidebarIsCollapsed);
    }
  };

  const handleMobileSearchSidebarVisibility = () => {
    console.log("FLIPPED");
    setMobileSearchbarVisibility(!mobileSearchbarVisibility);
  };

  const handleMobileNotificationSidebar = () => {
    setShowMobileNotificationSidebar(!showMobileNotificationSidebar);
  };

  const triggerFeedbackAlert = () => {
    showFeedback("This is a test alert!", "success"); // You can change the message and type
  };

  const handleLogOut = () => {
    // Clear token
    localStorage.removeItem("token");

    // Reset states
    setCreatePostVisible(false);
    setShowNotificationSidebar(false);
    setSearchbarVisibility(false);
    setMobileSearchbarVisibility(false);
    setShowMobileNotificationSidebar(false);
    setSettingsMobileVisibility(false);

    // Disconnect socket
    socket.disconnect();

    // Navigate to the login page or reload
    if (location.pathname === "/") {
      window.location.reload(); // Full page reload ensures complete cleanup
    } else {
      navigate("/"); // Navigate to the home page
    }
  };

  useEffect(() => {
    const userId = user && user._id;

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
  }, [user && user._id]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark-mode") {
      document.body.classList.add("dark-mode");
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const body = document.body;
    body.classList.toggle("dark-mode");
    const isDarkModeEnabled = body.classList.contains("dark-mode");
    setIsDarkMode(isDarkModeEnabled);
    const theme = isDarkModeEnabled ? "dark-mode" : "light-mode";
    localStorage.setItem("theme", theme);
  };

  return (
    <>
      {isMobile ? (
        <>
          <div className="sideBar-mobile">
            <div
              className={`home-mobile sidebar-mobile-btn ${
                location.pathname === "/" ? "active" : ""
              }`}
              onClick={() => {
                navigate("/");
              }}
            >
              <GoHome />
            </div>
            <div
              className="create-mobile sidebar-mobile-btn"
              onClick={handleCreatePostVisibilty}
            >
              <GoPlusCircle />
            </div>
            <div
              className={`explore-mobile sidebar-mobile-btn ${
                location.pathname === "/explore" ? "active" : ""
              }`}
              onClick={() => {
                navigate("/explore");
              }}
            >
              <MdOutlineExplore />
            </div>
            <div
              className={`message-mobile sidebar-mobile-btn ${
                location.pathname === "/messages" ? "active" : ""
              }`}
              onClick={() => {
                navigate("/messages");
              }}
            >
              <MdOutlineMessage />
            </div>
            <div
              className={`profile-mobile sidebar-mobile-btn ${
                user && location.pathname === `/${user.userName}`
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                navigate(`/${user.userName}`);
              }}
            >
              <img src={user && user.avatar} alt="" />
            </div>
            <div
              className="settings-mobile sidebar-mobile-btn"
              onClick={() => {
                setSettingsMobileVisibility(!settingsMobileVisibility);
              }}
            >
              <IoIosSettings />
              {settingsMobileVisibility && (
                <div className="settingMenu-mobile">
                  <div
                    className="darkModeToggle-mobile "
                    onClick={toggleDarkMode}
                  >
                    {isDarkMode ? <MdOutlineLightMode /> : <MdDarkMode />}{" "}
                    <big>{isDarkMode ? "Light Mode" : "Dark Mode"}</big>
                  </div>
                  <div
                    className="logOut-mobile"
                    onClick={() => {
                      localStorage.removeItem("token");
                      if (location.pathname === "/") {
                        window.location.reload();
                      } else {
                        navigate("/");
                      }
                    }}
                  >
                    <TbLogout2 />
                    <big>Log Out</big>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="sidebar-header-mobile">
            <div className="logo-mobile">Tholos.</div>
            <div
              className="search-mobile"
              onClick={() => {
                handleMobileSearchSidebarVisibility();
              }}
            >
              <GoSearch />
            </div>
            <div
              className="notification-mobile sidebar-mobile-btn"
              onClick={handleMobileNotificationSidebar}
            >
              <GoBell />
              {unreadCount > 0 && (
                <div className="notificationCount-mobile">
                  {unreadCount < 10 ? unreadCount : "9+"}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className={`sideBar ${sidebarIsCollapsed ? "collapsed" : ""}`}>
          <div className="logo">Tholos.</div>

          <div className="logoIcon">
            <HiOutlineBuildingLibrary />
          </div>

          <div
            className={`home sidebarBtn ${
              location.pathname === "/" ? "active" : ""
            }`}
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

          <div
            className="create sidebarBtn"
            onClick={handleCreatePostVisibilty}
          >
            <GoPlusCircle />
            <big>Create</big>
          </div>

          <div
            className={`explore sidebarBtn ${
              location.pathname === "/explore" ? "active" : ""
            }`}
            onClick={() => {
              navigate("/explore");
            }}
          >
            <MdOutlineExplore />
            <big>Explore</big>
          </div>

          <div
            className={`messages sidebarBtn ${
              location.pathname === "/messages" ? "active" : ""
            }`}
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
            onClick={handleNotificationSidebar}
          >
            <GoBell />
            {unreadCount > 0 && (
              <span className="notificationCount">{unreadCount}</span>
            )}{" "}
            {/* Show unread count */}
            <big>Notifications</big>
          </div>

          <div
            className={`profileBtn sidebarBtn ${
              user && location.pathname === `/${user.userName}` ? "active" : ""
            }`}
            onClick={() => {
              navigate(`/${user && user.userName}`);
            }}
          >
            <div className="imgWrapper ">
              <img src={user && user.avatar} alt="" />
            </div>
            <big>Profile</big>
          </div>

          <div className="darkModeToggle sidebarBtn" onClick={toggleDarkMode}>
            {isDarkMode ? <MdOutlineLightMode /> : <MdDarkMode />}{" "}
            <big>{isDarkMode ? "Light Mode" : "Dark Mode"}</big>
          </div>

          <div className="logOut sidebarBtn" onClick={handleLogOut}>
            <TbLogout2 />
            <big>Log Out</big>
          </div>
        </div>
      )}

      {isMobile
        ? mobileSearchbarVisibility && (
            <SearchSidebar
              isVisible={false} // or any value you need for mobile desktop check
              mobileIsVisible={mobileSearchbarVisibility}
            />
          )
        : searchSidebarVisibility && (
            <SearchSidebar
              isVisible={searchSidebarVisibility}
              mobileIsVisible={false}
            />
          )}

      {showNotificationSidebar && (
        <NotificationSidebar
          isVisible={showNotificationSidebar}
          setUnreadCount={setUnreadCount}
        />
      )}

      {showMobileNotificationSidebar && (
        <NotificationSidebar
          mobileIsVisible={showMobileNotificationSidebar}
          setUnreadCount={setUnreadCount}
          handleMobileNotificationSidebar={handleMobileNotificationSidebar}
        />
      )}

      {createPostVisible && (
        <CreatePost
          isVisible={createPostVisible}
          handleCreatePostVisibilty={handleCreatePostVisibilty}
        />
      )}
    </>
  );
}

export default SideBar;
