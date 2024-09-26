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

function HeaderSidebarSwitch() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;

  const username = decodedToken ? decodedToken.userName : null;

  const isLoggedIn = !!username;

  const { user, error, loading } = useUserInfo(username);

  return <>{isLoggedIn ? <SideBar user={user} /> : <Header />}</>;
}

export default HeaderSidebarSwitch;
