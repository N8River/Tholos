import { useEffect, useState } from "react";
import "./friendsHeader.css";
import { AUTH_HEADER, BACKEND_URL, JSON_HEADERS } from "../../config/config";
import { useNavigate } from "react-router-dom";
import useTokenVerification from "../../hooks/useTokenVerification";
import useTokenValidation from "../../hooks/useTokenVerification";

function FriendsHeader() {
  const token = localStorage.getItem("token");

  const { isValid, loading: tokenLoading } = useTokenValidation(token);

  const navigate = useNavigate();
  useEffect(() => {
    if (!tokenLoading) {
      if (!isValid) {
        localStorage.removeItem(token);
        navigate("/explore");
      }
    }
  }, [navigate, isValid, tokenLoading]);

  // useTokenVerification();

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
