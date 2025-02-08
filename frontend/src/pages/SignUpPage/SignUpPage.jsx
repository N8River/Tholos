import { useNavigate } from "react-router-dom";
import DummyFooter from "../../components/dummyFooter/dummyFooter";
import TholosPreview from "../../components/tholosPreview/tholosPreview";
import SignUpForm from "./SignUpForm/SignUpForm";
import "./SignUpPage.css";
import { useEffect } from "react";
import useTokenVerification from "../../hooks/useTokenVerification";

function SignUpPage() {
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
      <div className="signUpContainer">
        <TholosPreview />
        <SignUpForm />
      </div>

      <DummyFooter />
    </>
  );
}

export default SignUpPage;
