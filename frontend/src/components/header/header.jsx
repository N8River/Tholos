import "./header.css";

import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  return (
    <>
      <div className="header">
        <div
          className="logo"
          onClick={() => {
            navigate("/");
          }}
        >
          Tholos.
        </div>
        <div
          className="signUp"
          onClick={() => {
            navigate("/signup");
          }}
        >
          Sign Up
        </div>
        <div
          className="login"
          onClick={() => {
            navigate("/login");
          }}
        >
          Login
        </div>
      </div>
    </>
  );
}

export default Header;
