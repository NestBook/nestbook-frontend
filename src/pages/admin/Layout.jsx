import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Layout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen font-poppins text-gray-800 bg-gray-50">
      {/* Thêm flex flex-col để chia bố cục trên/dưới cho Sidebar */}
      <aside className="w-64 border-r bg-white flex flex-col">
        <div className="p-5 font-bold text-xl text-blue-600">Admin Panel</div>

        {/* Thêm flex-1 để phần menu này chiếm hết không gian trống, đẩy nút Quay về xuống đáy */}
        <nav className="flex flex-col flex-1">
          <Link to="/admin" className="px-5 py-3 hover:bg-gray-100 transition">
            Dashboard
          </Link>

          <Link
            to="/admin/hotels"
            className="px-5 py-3 hover:bg-gray-100 transition"
          >
            Hotels
          </Link>

          <Link
            to="/admin/reviews"
            className="px-5 py-3 hover:bg-gray-100 transition"
          >
            Reviews
          </Link>
        </nav>

        {/* Nút đăng xuất */}
        <div className="p-5 border-t border-gray-200">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center justify-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition bg-red-50 hover:bg-red-100 py-2.5 rounded-lg cursor-pointer"
          >
            {/* Icon đăng xuất (Logout) */}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
