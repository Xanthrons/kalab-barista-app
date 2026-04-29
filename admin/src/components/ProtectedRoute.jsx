import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, roles = [] }) {
  const { ready, isAuthenticated, user } = useAuth();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-bg text-admin-text">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
