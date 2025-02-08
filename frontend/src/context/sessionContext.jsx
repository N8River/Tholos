import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { BACKEND_URL } from "../config/config";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [decodedToken, setDecodedToken] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/verify-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setDecodedToken(jwtDecode(token));
          setIsVerified(true);
        } else {
          localStorage.removeItem("token");
          setToken(null);
          navigate("/login");
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem("token");
        setToken(null);
        navigate("/login");
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <SessionContext.Provider value={{ token, decodedToken, isVerified, setToken }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
