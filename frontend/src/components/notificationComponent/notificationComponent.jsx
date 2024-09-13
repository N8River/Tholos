import { useEffect, useState } from "react";
import io from "socket.io-client";
import { BACKEND_URL, JSON_HEADERS, AUTH_HEADER } from "../../config/config";
import "./notificationComponent.css";
import { jwtDecode } from "jwt-decode";
import NotificationMessage from "./notificationMessage/notificationMessage";

const token = localStorage.getItem("token");
const socket = io(BACKEND_URL, {
  query: { userId: jwtDecode(token).userId },
});

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

  const handleNotificationClick = async (notificationId) => {
    try {
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

  return (
    <div className="notificationDropdownComponent">
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div
            key={notification._id}
            className={`notificationItem ${
              notification.isRead ? "read" : "unread"
            }`}
            onClick={() => handleNotificationClick(notification._id)} // Mark as read on click
          >
            <NotificationMessage notification={notification} />
            {/* {notification.message} */}
            {/* Link to the post or user based on the notification type */}
            {/* {notification.type === "like" && (
              <a href={`/post/${notification.post}`} className="linkToPost">
                View Post
              </a>
            )}
            {notification.type === "comment" && (
              <a href={`/post/${notification.post}`} className="linkToPost">
                View Comment
              </a>
            )}
            {notification.type === "follow" && (
              <a href={`/${notification.user}`} className="linkToProfile">
                View Profile
              </a>
            )} */}
          </div>
        ))
      ) : (
        <p>No new notifications</p>
      )}
    </div>
  );
}

export default NotificationComponent;
