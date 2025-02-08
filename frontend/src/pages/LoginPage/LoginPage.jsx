import { useState, useEffect } from "react";
import LoginForm from "./LoginForm/LoginForm";

import "./LoginPage.css";
import DummyFooter from "../../components/dummyFooter/dummyFooter";
import TholosPreview from "../../components/tholosPreview/tholosPreview";
import { useNavigate } from "react-router-dom";
import useTokenVerification from "../../hooks/useTokenVerification";

function LoginPage() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // useTokenVerification();

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <>
      <div className="loginPageContainer">
        <TholosPreview />
        <LoginForm />
      </div>
      <DummyFooter />
    </>
  );
}

export default LoginPage;
