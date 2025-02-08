import { Navigate, useParams } from "react-router-dom";
import { isTokenExpired } from "../utils/utils";
import useTokenVerification from "../hooks/useTokenVerification";

function PrivateRoute({ element: Component, ...rest }) {
  const token = localStorage.getItem("token");

  // useTokenVerification();

  // If no token or token is expired, redirect to login with a session expiration message
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token"); // Remove token if it's expired
    return (
      <Navigate
        to="/login"
        state={{ message: "Session expired. Please log in again." }}
      />
    );
  }

  // Pass params and other props
  const params = useParams();
  return <Component {...rest} params={params} />;
}

export default PrivateRoute;
