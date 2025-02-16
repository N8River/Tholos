import { Navigate, useParams } from "react-router-dom";
import { isTokenExpired } from "../utils/utils";
import { jwtDecode } from "jwt-decode";

function PrivateRoute({ element: Component, ...rest }) {
  const token = localStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    return (
      <Navigate
        to="/login"
        state={{ message: "Session expired. Please log in again." }}
      />
    );
  }

  // Decode the token to get the authenticated username
  const decodedToken = jwtDecode(token);
  const params = useParams();

  // Only check if a username param exists in the URL
  if (params.username && params.username !== decodedToken.userName) {
    return <Navigate to={`/${decodedToken.userName}/edit`} />;
  }

  return <Component {...rest} params={params} />;
}

export default PrivateRoute;
