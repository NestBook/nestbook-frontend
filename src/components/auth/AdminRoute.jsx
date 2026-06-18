import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ROLES } from "../../constants/roles";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Đang tải...
      </div>
    );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== ROLES.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
