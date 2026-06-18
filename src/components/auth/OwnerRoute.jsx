import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ROLES } from "../../constants/roles";

const OwnerRoute = ({ children }) => {
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

  if (user.role !== ROLES.HOTEL_OWNER) {
    // Nếu cố tình truy cập nhưng sai quyền, đẩy về trang chủ
    return <Navigate to="/" replace />;
  }

  return children;
};

export default OwnerRoute;
