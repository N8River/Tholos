import { useEffect, useState } from "react";
import io from "socket.io-client";
import { BACKEND_URL, JSON_HEADERS, AUTH_HEADER } from "../../config/config";
import "./notificationComponent.css";
import { jwtDecode } from "jwt-decode";
import NotificationMessage from "./notificationMessage/notificationMessage";

const token = localStorage.getItem("token");
const socket = token
  ? io(BACKEND_URL, {
      query: { userId: jwtDecode(token).userId },
    })
  : null;

function NotificationComponent({ setUnreadCount }) {
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

      // Make API call to mark the notification as read
      const response = await fetch(
        `${BACKEND_URL}/api/notification/mark-as-read/${notificationId}`,
        {
          method: "PATCH",
          headers,
        }
      );

      if (response.ok) {
        // Update the notifications state to mark the notification as read
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification._id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );

        // Decrease unread count
        setUnreadCount((prevCount) => prevCount - 1);
      }
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
    <div className="notificationDropdownComponent">
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div
            key={notification._id}
            className={`notificationItem ${
              notification.isRead ? "read" : "unread"
            }`}
            onClick={() =>
              handleNotificationClick(notification._id, notification.type)
            } // Mark as read on click
          >
            <NotificationMessage
              notification={notification}
              handleApproveRequest={handleApproveRequest}
              handleRejectRequest={handleRejectRequest}
            />
          </div>
        ))
      ) : (
        <p>No new notifications</p>
      )}
    </div>
  );
}

export default NotificationComponent;
