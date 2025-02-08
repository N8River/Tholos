import NotificationComponent from "../notificationComponent/notificationComponent";
import "./notificationSidebar.css";
import { IoIosArrowBack } from "react-icons/io";

import useResponsive from "../../hooks/useResponsive";
import { useEffect, useState } from "react";

function NotificationSidebar({
  setUnreadCount,
  isVisible,
  mobileIsVisible,
  handleMobileNotificationSidebar,
}) {
  // console.log("oOOOOOOOOOOOOOOOOOOO");
  const isMobile = useResponsive(768);
  console.log(!isMobile);

  const [x, setX] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setX(isVisible);
    }, 1);
  }, []);

  return (
    <>
      {!isMobile && (
        <>
          <div className={`notificationSidebar ${x ? "show" : ""}`}>
            <h4>Notifications</h4>
            <NotificationComponent setUnreadCount={setUnreadCount} />
          </div>
        </>
      )}

      {mobileIsVisible && (
        <div className={`notificationSidebar-mobile`}>
          <div className="notificationSidebar-mobile-header">
            <IoIosArrowBack onClick={handleMobileNotificationSidebar} />
            <big>Notifications</big>
          </div>
          <NotificationComponent setUnreadCount={setUnreadCount} />
        </div>
      )}
    </>
  );
}

export default NotificationSidebar;
