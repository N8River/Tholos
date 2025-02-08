import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL, JSON_HEADERS } from "../../../config/config";

import "./notificationMessage.css";
import useTokenVerification from "../../../hooks/useTokenVerification";
import useTokenValidation from "../../../hooks/useTokenVerification";

function NotificationMessage({
  notification,
  handleApproveRequest,
  handleRejectRequest,
  handleNotificationClick,
  isRead,
}) {
  console.log("🔴 NOTIFICATION", notification);
  let link;
  let btnText;
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const {
    decodedToken,
    isValid,
    loading: tokenLoading,
  } = useTokenValidation(token);

  useEffect(() => {
    if (!tokenLoading) {
      if (!isValid) {
        localStorage.removeItem("token");
        navigate("/explore");
      }
    }
  }, [navigate, isValid, tokenLoading, decodedToken]);

  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/user/${notification.sender}`,
          {
            headers: JSON_HEADERS,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user info");
        }

        const responseData = await response.json();
        setUserInfo(responseData);
        console.log(responseData);
      } catch (error) {
        console.log("Error fetching user info", error);
      }
    };

    fetchUser();
  }, []);

  if (notification.type === "message") {
    btnText = "Reply";
    link = `/messages/${notification.sender}`;
  } else if (notification.type === "like") {
    btnText = "View Post";
    link = `/${jwtDecode(token).userName}/p/${notification.post}`;
  } else if (notification.type === "comment") {
    btnText = "View Post";
    link = `/${jwtDecode(token).userName}/p/${notification.post}`;
  } else if (notification.type === "follow") {
    btnText = `View Profile`;
    link = `/${userInfo.userName}/`;
  } else if (notification.type === "follow-request") {
    // For follow request notification

    return (
      <div
        className={`notificationMessage ${isRead ? "read" : "unread"} `}
        onClick={() => {
          handleNotificationClick(notification._id, notification.type);
        }}
      >
        <div className="notificationUser">
          <div className="notificationUserAvatar">
            <img src={userInfo.avatar} alt="" />
          </div>
        </div>
        <div className="notificationMessageText">
          <p>
            <strong>{userInfo.userName}</strong> {notification.message}
          </p>
        </div>
        <div className="followRequestButtons">
          <button
            className="approveRequestBtn"
            onClick={() => handleApproveRequest(notification.sender)}
          >
            Approve
          </button>
          <button
            className="rejectRequestBtn"
            onClick={() => handleRejectRequest(notification.sender)}
          >
            Reject
          </button>
        </div>
      </div>
    );
  } else if (notification.type === "follow-accept") {
    btnText = `View their profile`;
    link = `/${userInfo.userName}/`;
  }

  return (
    <>
      <div
        className={`notificationMessage ${isRead ? "read" : "unread"} `}
        onClick={() => {
          handleNotificationClick(notification._id, notification.type);
        }}
      >
        <div className="notificationUser">
          <div className="notificationUserAvatar">
            <img src={userInfo.avatar} alt="" />
          </div>
        </div>
        <div className="notificationMessageText">
          <p>
            <strong>{userInfo.userName}</strong> {notification.message}
          </p>
        </div>
        <button
          className="notiActionBtn"
          onClick={() => {
            navigate(link);
          }}
        >
          {btnText}
        </button>
      </div>
    </>
  );
}

export default NotificationMessage;
