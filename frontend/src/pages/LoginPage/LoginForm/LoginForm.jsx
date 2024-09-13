import { useState } from "react";
import "./loginForm.css";
import { BACKEND_URL, JSON_HEADERS } from "../../../config/config";
import { useNavigate } from "react-router-dom";

function LoginForm() {
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
      <div className="loginForm">
        <h2>LOGIN</h2>
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
        <button className="btn" onClick={handleLogin}>
          LOGIN
        </button>
        <div>
          Don't have an account?{" "}
          <p
            onClick={() => {
              navigate("/signup");
            }}
          >
            Sign Up
          </p>
        </div>
      </div>
    </>
  );
}

export default LoginForm;
