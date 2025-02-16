import {
  useNavigate,
  useRouteError,
  useRouteLoaderData,
} from "react-router-dom";
import useUserInfo from "../../hooks/useUserInfo";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import SideBar from "../sideBar/sideBar";
import Header from "../header/header";
import useTokenVerification from "../../hooks/useTokenVerification";
import useTokenValidation from "../../hooks/useTokenVerification";

function HeaderSidebarSwitch() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const {
    decodedToken,
    isValid,
    loading: tokenLoading,
  } = useTokenValidation(token);

  useEffect(() => {
    if (!tokenLoading) {
      if (token && !isValid) {
        localStorage.removeItem("token");
        navigate("/explore");
      }
    }
  }, [navigate, tokenLoading, isValid]);

  const username = decodedToken ? decodedToken.userName : null;

  const isLoggedIn = !!username;

  const { user, error, loading } = useUserInfo(username);

  if (tokenLoading) {
    return <></>;
  }

  return <>{isLoggedIn ? <SideBar user={user} /> : <Header />}</>;
}

export default HeaderSidebarSwitch;
