import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL, JSON_HEADERS } from "../../../config/config";

function NotificationMessage({ notification }) {
  console.log("🔴 NOTIFICATION", notification);
  let link;
  let btnText;
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);

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
    btnText = "View Message";
    link = `/messages/${notification.conversation}`;
  } else if (notification.type === "like") {
    btnText = "View Post";
    link = `/${decodedToken.userName}/p/${notification.post}`;
  } else if (notification.type === "comment") {
    btnText = "View Post";
    link = `/${decodedToken.userName}/p/${notification.post}`;
  } else if (notification.type === "follow") {
    btnText = `View their profile`;
    link = `/${userInfo.userName}/`;
  }

  return (
    <>
      <div className="notificationMessage">
        <p>{notification.message}</p>
        <button
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
