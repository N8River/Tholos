import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config/config";

const useCurrentUser = (token) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setError("No token provided");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/api/user/current-user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user info:", error);
        setError(error.message);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token, navigate]);

  return { user, loading, error };
};

export default useCurrentUser;
