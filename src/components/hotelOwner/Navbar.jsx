import { Link, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white transition-all duration-300">
      <Link to="/">
        <img src={assets.logo12} alt="logo" className="h-9 invert opacity-80" />
      </Link>

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          Xin chào, {user?.name || user?.email || "Owner"}
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-50 text-red-500 px-4 py-2 rounded text-sm hover:bg-red-100 transition"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Navbar;
