import { useState } from "react";
import "./loginForm.css";
import { BACKEND_URL, JSON_HEADERS } from "../../../config/config";
import { useNavigate, useLocation } from "react-router-dom";
import { FaGooglePlay, FaApple } from "react-icons/fa";
import { useFeedback } from "../../../context/feedbackContext";

function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { showFeedback } = useFeedback();

  // Extract any message passed during redirect (like session expiration)
  const message = location.state?.message;

  const handleLogin = async () => {
    if (!password && !identifier) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          identifier: identifier,
          password: password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Check if the error is due to validation
        console.log("🔴 Response Data", responseData);
        if (responseData.errors) {
          responseData.errors.forEach((error) => {
            console.log("Full error object: ", error);
            showFeedback(`${error.message}`, "error");
          });
        } else {
          showFeedback(responseData.message, "error");
        }
        return;
      }

      localStorage.setItem("token", responseData.token);
      navigate("/");
    } catch (error) {
      showFeedback("Error logging in: " + error.message, "error");
      console.log("Error logging in:", error);
    }
  };

  return (
    <>
      <div className="loginForm">
        <div className="loginFormLogo">Tholos.</div>

        {/* Show session expiration message */}
        {message && <p className="errorMessage">{message}</p>}

        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Email or Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button className="loginFormBtn" onClick={handleLogin}>
          Log In
        </button>
        <div className="signUpMessage">
          Don't have an account?{" "}
          <p
            onClick={() => {
              navigate("/signup");
            }}
          >
            Sign Up
          </p>
        </div>

        <div className="getTheApp">
          <p className="getTheAppText">Get the app</p>
          <div className="getTheAppWrapper">
            <div className="getTheAppBtn">
              <FaApple /> Apple Store
            </div>
            <div className="getTheAppBtn">
              <FaGooglePlay /> Google Play
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginForm;
