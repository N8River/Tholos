import { Navigate, useParams } from "react-router-dom";

function PrivateRoute({ element: Component, ...rest }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  // Pass props like params, state, or any additional props
  const params = useParams();
  return <Component {...rest} params={params} />;
}

export default PrivateRoute;
