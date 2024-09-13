import { useState } from "react";
import "./SignUpForm.css";
import { BACKEND_URL, JSON_HEADERS } from "../../../config/config";
import { useNavigate } from "react-router-dom";

function SignUpForm() {
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

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

      if (!response.ok) {
        throw new Error("Failed to sign up");
      }

      const responseData = await response.json();

      navigate("/login");
    } catch (error) {
      console.log("Error signing up:", error);
    }
  };

  return (
    <>
      <div className="signUpForm">
        <h2>SIGN UP</h2>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="FULL NAME"
          required
        />
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="USER NAME"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="EMAIL"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="PASSWORD"
          required
        />
        <button className="btn" onClick={handleSignUp}>
          SIGN UP
        </button>
        <div>
          Already have an account?{" "}
          <p
            onClick={() => {
              navigate("/login");
            }}
          >
            Login
          </p>
        </div>
      </div>
    </>
  );
}

export default SignUpForm;
