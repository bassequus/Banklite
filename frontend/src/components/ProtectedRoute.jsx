import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const isLoggedIn = token && token.trim() !== "";
  const hasCorrectRole = !allowedRole || role === allowedRole;

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (!hasCorrectRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;