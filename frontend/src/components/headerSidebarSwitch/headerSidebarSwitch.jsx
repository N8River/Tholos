import { useNavigate } from "react-router-dom";
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
  // console.log(isLoggedIn);

  const userInfo = useUserInfo(username);
  const [user, setUser] = useState(userInfo || {});

  useEffect(() => {
    if (userInfo) {
      setUser(userInfo);
    }
  }, [userInfo]);

  return <>{isLoggedIn ? <SideBar user={user} /> : <Header />}</>;
}

export default HeaderSidebarSwitch;
