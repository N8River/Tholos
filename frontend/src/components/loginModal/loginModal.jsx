import { IoClose } from "react-icons/io5";
import "./loginModal.css";
import { useState } from "react";
import { BACKEND_URL, JSON_HEADERS } from "../../config/config";
import { useNavigate } from "react-router-dom";

function LoginModal({ user }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          identifier: identifier,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to login");
      }

      const responseData = await response.json();
      localStorage.setItem("token", responseData.token);
      navigate("/");
    } catch (error) {
      console.log("Error logging in:", error);
    }
  };

  return (
    <>
      <div className="loginModalOverlay"></div>
      <div className="loginModal">
        <div className="loginModalHeader">
          {user ? (
            <>
              <div className="loginModalUserAvatar">
                <img src={user.avatar} alt="" />
              </div>
              <big>See more from {user.userName}</big>
              <p>
                Log in to see posts from friends and discover other accounts
                you'll love.
              </p>
            </>
          ) : (
            <>
              <big>Log in to explore more posts</big>
              <p>Log in to interact with posts and see more content.</p>
            </>
          )}
        </div>
        <div className="loginModalForm">
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="EMAIL OR USERNAME"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="PASSWORD"
            required
          />
          <div className="loginModalFormSubmitBtn" onClick={handleLogin}>
            Log In
          </div>
        </div>
        <div className="loginModalFooter">
          <p>Don't have an account?</p>
          <p className="peePoo" onClick={()=>{
            navigate('/signup')
          }}>Sign Up</p>
        </div>
      </div>
    </>
  );
}

export default LoginModal;
