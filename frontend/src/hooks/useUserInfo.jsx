import { useState, useEffect } from "react";
import { BACKEND_URL, JSON_HEADERS, AUTH_HEADER } from "../config/config";
import useTokenVerification from "./useTokenVerification";
import { useNavigate } from "react-router-dom";
import useTokenValidation from "./useTokenVerification";

const useUserInfo = (username) => {
  // console.log(username);

  const [user, setUser] = useState(null);
  const [postCount, setPostCount] = useState(0);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const headers = token
    ? { ...JSON_HEADERS, ...AUTH_HEADER(token) }
    : { ...JSON_HEADERS };

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!username) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/user/profile/${username}`,
          {
            method: "GET",
            headers: headers,
          }
        );

        if (response.status === 404) {
          setError("User not found"); // Handle 404 error
          setUser(null);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch user info");
        }

        const responseData = await response.json();

        // console.log(responseData);
        setUser(responseData.user);
        setPostCount(responseData.postCount);
        // console.log("🔴 Logged in User", responseData);
      } catch (error) {
        setError(error.message);
        console.log("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [username]);

  return { user, postCount, error, loading };
};

export default useUserInfo;
