import { Navigate, useParams } from "react-router-dom";

function PrivateRoute({ element: Component, ...rest }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return <Component />;
}

export default PrivateRoute;
