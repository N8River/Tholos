import { useState } from "react";
import "./SignUpForm.css";
import { BACKEND_URL, JSON_HEADERS } from "../../../config/config";
import { useNavigate } from "react-router-dom";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { useFeedback } from "../../../context/feedbackContext";

function SignUpForm() {
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { showFeedback } = useFeedback();

  const handleSignUp = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          fullName: fullName,
          userName: userName,
          email: email,
          password: password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Display the first validation error directly
        if (responseData.message) {
          showFeedback(responseData.message, "error");
        } else {
          showFeedback(responseData.message, "error");
        }
        return;
      }

      navigate("/login");
    } catch (error) {
      console.log("Error signing up:", error);
    }
  };

  return (
    <>
      <div className="signUpForm">
        <div className="signupFormLogo">Tholos.</div>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          required
        />
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="User Name"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button className="signUpBtn" onClick={handleSignUp}>
          Sign Up
        </button>
        <div className="loginMessage">
          Already have an account?{" "}
          <p
            onClick={() => {
              navigate("/login");
            }}
          >
            Login
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

export default SignUpForm;
