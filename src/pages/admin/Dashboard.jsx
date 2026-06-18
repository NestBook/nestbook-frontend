import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getHotelsApi } from "../../services/adminService"; // Import API lấy khách sạn

const Dashboard = () => {
  // State lưu trữ số liệu thống kê (Mặc định là 0)
  const [stats, setStats] = useState({
    totalHotels: 0,
    assignedHotels: 0,
    unassignedHotels: 0,
  });

  // State lưu danh sách khách sạn mới
  const [recentHotels, setRecentHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API và tính toán dữ liệu khi load trang
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await getHotelsApi();
        const hotelsData = res.data?.data ?? res.data ?? [];

        // 1. Tính toán số liệu thống kê
        const total = hotelsData.length;
        // Kiểm tra xem khách sạn có ownerId (hoặc object owner) hay không
        const assigned = hotelsData.filter((h) => h.ownerId || h.owner).length;
        const unassigned = total - assigned;

        setStats({
          totalHotels: total,
          assignedHotels: assigned,
          unassignedHotels: unassigned,
        });

        // 2. Lấy 5 khách sạn mới nhất (Đảo ngược mảng và cắt 5 phần tử đầu)
        // Nếu Backend có trả về createdAt thì bạn có thể sort, nếu không dùng cách này cho MVP là đủ
        const latestHotels = [...hotelsData].reverse().slice(0, 5);
        setRecentHotels(latestHotels);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-gray-500">Đang tải dữ liệu Dashboard...</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Admin Dashboard
      </h1>
      <p className="text-gray-600 mb-8">
        Quản lý tổng quan danh sách Khách sạn trên hệ thống.
      </p>

      {/* 3 Thẻ Chỉ số Tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Tổng số khách sạn */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Tổng Khách sạn</p>
            <p className="text-gray-800 text-2xl font-bold">
              {stats.totalHotels}
            </p>
          </div>
        </div>

        {/* Khách sạn Đã gán Owner */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Đã gán Owner</p>
            <p className="text-gray-800 text-2xl font-bold">
              {stats.assignedHotels}
            </p>
          </div>
        </div>

        {/* Khách sạn Chưa gán Owner (Cần chú ý) */}
        <div className="bg-white border border-red-200 rounded-lg p-5 shadow-sm flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-full text-red-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <p className="text-red-500 text-sm font-medium">Chưa có Owner</p>
            <p className="text-red-600 text-2xl font-bold">
              {stats.unassignedHotels}
            </p>
          </div>
        </div>
      </div>

      {/* Bảng hoạt động: Khách sạn mới */}
      <h2 className="text-xl text-gray-800 font-medium mb-4">
        Khách sạn mới thêm (Gần đây)
      </h2>
      <div className="w-full max-w-4xl text-left border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 text-gray-600 font-medium text-sm">
                Tên Khách sạn
              </th>
              <th className="py-3 px-4 text-gray-600 font-medium text-sm max-sm:hidden">
                Thành phố
              </th>
              <th className="py-3 px-4 text-gray-600 font-medium text-sm text-center">
                Trạng thái Owner
              </th>
              <th className="py-3 px-4 text-gray-600 font-medium text-sm text-center">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {recentHotels.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-6 text-center text-gray-400">
                  Chưa có khách sạn nào.
                </td>
              </tr>
            ) : (
              recentHotels.map((hotel) => (
                <tr
                  key={hotel.id}
                  className="border-b last:border-none border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-gray-800">{hotel.name}</td>
                  <td className="py-3 px-4 text-gray-500 max-sm:hidden">
                    {hotel.city}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {/* Kiểm tra nếu có ownerId thì hiển thị đã gán kèm theo ID của Owner đó */}
                    {hotel.ownerId || hotel.owner ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Đã gán (ID: {hotel.ownerId || hotel.owner?.id})
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Chưa có
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      to="/admin/hotels"
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      Tới trang quản lý
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
