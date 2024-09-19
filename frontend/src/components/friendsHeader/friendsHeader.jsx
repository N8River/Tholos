import { useEffect, useState } from "react";
import "./friendsHeader.css";
import { AUTH_HEADER, BACKEND_URL, JSON_HEADERS } from "../../config/config";
import { useNavigate } from "react-router-dom";

const token = localStorage.getItem("token");

function FriendsHeader() {
  const navigate = useNavigate();
  const [followingUsers, setFollowingUser] = useState([]);

  useEffect(() => {
    const fetchFollowing = async () => {
      const response = await fetch(`${BACKEND_URL}/api/user/following`, {
        method: "GET",
        headers: {
          ...JSON_HEADERS,
          ...AUTH_HEADER(token),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch following users");
      }

      const responseData = await response.json();
      setFollowingUser(responseData.following);
      console.log(followingUsers);
    };

    fetchFollowing();
  }, []);

  return (
    <>
      <div className="friendsHeader">
        {followingUsers.length > 0 &&
          followingUsers.map((u) => {
            return (
              <div
                key={u._id}
                className="followingUserIcon"
                onClick={() => {
                  navigate(`/${u.userName}`);
                }}
              >
                <div className="followingUserAvatar">
                  <img src={u.avatar} alt="" />
                </div>
                <div className="followingUserUserName">
                  <p>{u.userName}</p>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
}

export default FriendsHeader;
