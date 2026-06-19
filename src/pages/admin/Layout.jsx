import { Outlet, Link } from "react-router-dom";

const Layout = () => {
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

        {/* Nút quay về trang chủ */}
        <div className="p-5 border-t border-gray-200">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 font-medium transition"
          >
            {/* Icon mũi tên quay lại */}
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Quay về trang chủ
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
