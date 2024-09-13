import { useState, useEffect } from "react";
import { BACKEND_URL, JSON_HEADERS, AUTH_HEADER } from "../config/config";

const useUserInfo = (username) => {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");
  const headers = token
    ? { ...JSON_HEADERS, ...AUTH_HEADER(token) }
    : { ...JSON_HEADERS };

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!username) return;

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/user/profile/${username}`,
          {
            method: "GET",
            headers: headers,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user info");
        }

        const responseData = await response.json();

        setUser(responseData);
        console.log(responseData);
      } catch (error) {
        console.log("Error fetching user info:", error);
      }
    };
    fetchUserInfo();
  }, [username]);

  return user;
};

export default useUserInfo;
