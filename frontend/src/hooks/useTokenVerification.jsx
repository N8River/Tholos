import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { BACKEND_URL } from "../config/config";

const useTokenValidation = (token) => {
  const [decodedToken, setDecodedToken] = useState(null);
  const [isValid, setIsValid] = useState(false); // Flag for token validity
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const verifyToken = async () => {
      // If no token is provided, treat it as a logged-out user (valid but no decoded token)
      if (!token) {
        setDecodedToken(null);
        setIsValid(false); // A missing token is not "valid," but we don’t redirect
        setLoading(false);
        return;
      }

      try {
        // Verify the token with the backend
        const response = await fetch(`${BACKEND_URL}/api/auth/verify-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Decode token safely and mark as valid
          const decoded = jwtDecode(token);
          setDecodedToken(decoded);
          setIsValid(true);
        } else {
          // Handle invalid token
          setDecodedToken(null);
          setIsValid(false);
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setDecodedToken(null);
        setIsValid(false);
      } finally {
        setLoading(false); // Always stop loading once verification is done
      }
    };

    verifyToken();
  }, [token]);

  return { decodedToken, isValid, loading };
};

export default useTokenValidation;
