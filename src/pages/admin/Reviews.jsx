import { useState, useEffect } from "react";
import Title from "../../components/Title";
import StarRating from "../../components/StarRating";
import { getHotelsApi, updateReviewStatusApi, deleteReviewApi } from "../../services/adminService";
import { getHotelReviewsApi } from "../../services/publicService";

const Reviews = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recentlyHidden, setRecentlyHidden] = useState([]);

  // 1. Tải danh sách khách sạn
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await getHotelsApi();
        const data = res.data?.data ?? res.data ?? [];
        setHotels(data);
        if (data.length > 0) {
          setSelectedHotelId(String(data[0].id));
        }
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách khách sạn.");
      }
    };
    fetchHotels();
  }, []);

  // 2. Tải danh sách đánh giá của khách sạn được chọn
  const loadReviews = async (hotelId, pageNum = 1) => {
    if (!hotelId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getHotelReviewsApi(hotelId, { page: pageNum, pageSize: 10 });
      const data = res.data?.data ?? res.data ?? { data: [], pagination: { page: 1, totalPages: 1 } };
      setReviews(data.data ?? []);
      setPagination(data.pagination ?? { page: 1, totalPages: 1 });
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedHotelId) {
      loadReviews(selectedHotelId, currentPage);
    }
  }, [selectedHotelId, currentPage]);

  const handleHotelChange = (e) => {
    setSelectedHotelId(e.target.value);
    setCurrentPage(1);
    setRecentlyHidden([]); // Reset list vừa ẩn khi đổi khách sạn
  };

  // 3. Thay đổi trạng thái hiển thị của đánh giá (VISIBLE/HIDDEN)
  const handleToggleStatus = async (reviewId, currentStatus) => {
    setError("");
    setSuccess("");
    const newStatus = currentStatus === "VISIBLE" ? "HIDDEN" : "VISIBLE";
    try {
      await updateReviewStatusApi(reviewId, newStatus);
      setSuccess("Cập nhật trạng thái đánh giá thành công!");

      if (newStatus === "HIDDEN") {
        // Tìm review trong list hiện tại để đưa vào cache ẩn tạm thời
        const hiddenReview = reviews.find((r) => r.id === reviewId);
        if (hiddenReview) {
          setRecentlyHidden((prev) => [...prev, { ...hiddenReview, status: "HIDDEN" }]);
        }
      } else {
        // Nếu hiện lại, xóa khỏi list ẩn tạm thời
        setRecentlyHidden((prev) => prev.filter((r) => r.id !== reviewId));
      }

      loadReviews(selectedHotelId, currentPage);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || "Cập nhật trạng thái thất bại.");
    }
  };

  // 4. Xóa đánh giá vĩnh viễn
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này?")) return;
    setError("");
    setSuccess("");
    try {
      await deleteReviewApi(reviewId);
      setSuccess("Xóa đánh giá thành công!");
      loadReviews(selectedHotelId, currentPage);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || "Xóa đánh giá thất bại.");
    }
  };

  return (
    <div>
      <Title
        align="left"
        font="outfit"
        title="Review Moderation"
        subtitle="Quản lý hiển thị và xóa các bình luận, đánh giá từ khách hàng."
      />

      {/* CHỌN KHÁCH SẠN */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mt-6 shadow-sm flex items-center gap-3">
        <label className="font-medium text-gray-700 min-w-24">
          Khách sạn:
        </label>
        <select
          value={selectedHotelId}
          onChange={handleHotelChange}
          className="border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500 max-w-md bg-gray-50 flex-1"
        >
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-500 border border-red-200 rounded text-sm">
          ⚠ {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded text-sm">
          ✓ {success}
        </div>
      )}

      {/* DANH SÁCH REVIEW */}
      <div className="w-full text-left border border-gray-300 rounded-lg overflow-hidden bg-white mt-6 shadow-sm">
        {loading ? (
          <p className="text-center text-gray-400 py-10 text-sm">Đang tải đánh giá...</p>
        ) : reviews.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">
            Chưa có đánh giá nào cho khách sạn này.
          </p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 text-sm">
              <tr>
                <th className="py-3 px-4 text-gray-800 font-medium w-1/4">Khách hàng / Mã Đặt</th>
                <th className="py-3 px-4 text-gray-800 font-medium text-center w-24">Đánh giá</th>
                <th className="py-3 px-4 text-gray-800 font-medium">Bình luận</th>
                <th className="py-3 px-4 text-gray-800 font-medium text-center w-32">Trạng thái</th>
                <th className="py-3 px-4 text-gray-800 font-medium text-center w-48">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-gray-50 transition">
                  <td className="py-4 px-4 text-gray-700">
                    <p className="font-semibold">
                      {rev.userId ? "Khách hàng Nestbook" : "Khách ẩn danh"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Mã đặt: {rev.bookingCode}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(rev.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center">
                      <StarRating rating={rev.rating} />
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 leading-relaxed max-w-md break-words">
                    {rev.content}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rev.status === "VISIBLE"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {rev.status === "VISIBLE" ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleToggleStatus(rev.id, rev.status)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded transition border cursor-pointer ${
                          rev.status === "VISIBLE"
                            ? "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                            : "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                        }`}
                      >
                        {rev.status === "VISIBLE" ? "Ẩn đi" : "Hiện lại"}
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="text-xs font-semibold px-2.5 py-1 rounded border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 cursor-pointer transition"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* DANH SÁCH REVIEW VỪA ẨN */}
      {recentlyHidden.length > 0 && (
        <div className="mt-8 bg-gray-50 border border-amber-200 rounded-lg p-5 shadow-sm">
          <h3 className="font-semibold text-amber-800 text-sm mb-3 flex items-center gap-2">
            <span>👁️‍🗨️</span> Đánh giá vừa ẩn tạm thời trong phiên làm việc (Có thể bấm để hiển thị lại)
          </h3>
          <div className="w-full text-left border border-gray-200 rounded-lg overflow-hidden bg-white">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {recentlyHidden.map((rev) => (
                  <tr key={rev.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-4 text-gray-500 w-1/4">
                      <p className="font-semibold text-gray-700">
                        {rev.userId ? "Khách hàng Nestbook" : "Khách ẩn danh"}
                      </p>
                      <p className="text-[10px] text-gray-400">Mã đặt: {rev.bookingCode}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-md break-words">
                      {rev.content}
                    </td>
                    <td className="py-3 px-4 text-center w-48">
                      <button
                        onClick={() => handleToggleStatus(rev.id, "HIDDEN")}
                        className="text-xs font-semibold px-3 py-1 rounded border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 cursor-pointer transition-all"
                      >
                        Hiện lại (Mở lại)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PHÂN TRANG */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 mb-8">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-50 cursor-pointer bg-white"
          >
            Trước
          </button>
          <span className="text-xs text-gray-500">
            Trang {currentPage} / {pagination.totalPages}
          </span>
          <button
            disabled={currentPage === pagination.totalPages}
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            className="px-3 py-1.5 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-50 cursor-pointer bg-white"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default Reviews;
