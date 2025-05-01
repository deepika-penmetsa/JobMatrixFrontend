import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = localStorage.getItem("jwtToken");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is defined, ensure user role matches
  if (allowedRoles && !allowedRoles.includes(localStorage.getItem("userRole"))) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
