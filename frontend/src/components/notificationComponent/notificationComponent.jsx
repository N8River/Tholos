import { useEffect, useState } from "react";
import io from "socket.io-client";
import { BACKEND_URL, JSON_HEADERS, AUTH_HEADER } from "../../config/config";
import "./notificationComponent.css";
import { jwtDecode } from "jwt-decode";
import NotificationMessage from "./notificationMessage/notificationMessage";
import { FaRegSmileBeam } from "react-icons/fa";
import useTokenVerification from "../../hooks/useTokenVerification";
import useTokenValidation from "../../hooks/useTokenVerification";
import { useNavigate } from "react-router-dom";

function NotificationComponent({ setUnreadCount }) {
  const token = localStorage.getItem("token");

  const {
    decodedToken,
    isValid,
    loading: tokenLoading,
  } = useTokenValidation(token);

  const navigate = useNavigate();

  useEffect(() => {
    if (!tokenLoading) {
      if (!isValid) {
        localStorage.removeItem(token);
        navigate("/explore");
      }
    }
  }, [navigate, isValid, tokenLoading, decodedToken]);

  const socket = token
    ? io(BACKEND_URL, {
        query: { userId: jwtDecode(token).userId },
      })
    : null;

  // Take the setUnreadCount as a prop
  const [notifications, setNotifications] = useState([]);

  const headers = {
    ...JSON_HEADERS,
    ...AUTH_HEADER(token),
  };

  // Fetch unread notifications when the component loads
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/notification/unread`, {
          headers,
        });
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.length); // Set the unread count for the sidebar
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    // Listen for real-time notifications
    socket.on("notification", (notification) => {
      setNotifications((prevNotifications) => [
        notification,
        ...prevNotifications,
      ]);
      setUnreadCount((prevCount) => prevCount + 1); // Increase unread count on new notification
    });

    return () => {
      socket.off();
    };
  }, [setUnreadCount]); // Include setUnreadCount in the dependency array

  const handleNotificationClick = async (notificationId, notificationType) => {
    try {
      if (notificationType === "follow-request") {
        return;
      }

      const notification = notifications.find((n) => n._id === notificationId);
      if (notification.isRead) return; // Prevent multiple clicks

      // Remove the notification from the UI **immediately** for smooth UX
      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n._id !== notificationId)
      );

      // Decrease unread count
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1));

      // Make API call to mark the notification as read
      await fetch(
        `${BACKEND_URL}/api/notification/mark-as-read/${notificationId}`,
        {
          method: "PATCH",
          headers,
        }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleApproveRequest = async (senderId) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/user/${senderId}/approve-follow-request`,
        {
          method: "POST",
          headers,
        }
      );
      if (response.ok) {
        alert("Follow request approved");
      }
    } catch (error) {
      console.error("Error approving follow request:", error);
    }
  };

  const handleRejectRequest = async (senderId) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/user/${senderId}/reject-follow-request`,
        {
          method: "POST",
          headers,
        }
      );
      if (response.ok) {
        alert("Follow request rejected");
      }
    } catch (error) {
      console.error("Error rejecting follow request:", error);
    }
  };

  return (
    <div className="notificationSidebarComponent">
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <NotificationMessage
            handleNotificationClick={handleNotificationClick}
            key={notification._id}
            isRead={notification.isRead}
            notification={notification}
            handleApproveRequest={handleApproveRequest}
            handleRejectRequest={handleRejectRequest}
          />
        ))
      ) : (
        <p className="noNewNoti">
          {" "}
          <FaRegSmileBeam />
          You're all caught up!
        </p>
      )}
    </div>
  );
}

export default NotificationComponent;
