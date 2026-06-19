import { useState, useEffect } from "react";
import StarRating from "./StarRating";
import {
  getHotelReviewsApi,
  getHotelRatingApi,
  getHotelRatingDistributionApi,
  createReviewApi,
} from "../services/publicService";

const RoomReviews = ({ hotelId, ratingStats, onReviewSubmitted }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewsPagination, setReviewsPagination] = useState({ page: 1, totalPages: 1 });
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [ratingDistribution, setRatingDistribution] = useState([]);

  // States cho form viết review
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewBookingCode, setReviewBookingCode] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitReviewError, setSubmitReviewError] = useState("");
  const [submitReviewSuccess, setSubmitReviewSuccess] = useState("");

  const fetchReviewsData = async (pageNum = 1) => {
    try {
      setReviewsLoading(true);

      let revData = { data: [], pagination: { page: 1, totalPages: 1 } };
      try {
        const reviewsRes = await getHotelReviewsApi(hotelId, { page: pageNum, pageSize: 5 });
        revData = reviewsRes.data?.data ?? reviewsRes.data ?? revData;
      } catch (err) {
        console.warn(`Lỗi lấy danh sách đánh giá cho hotel ${hotelId} (chưa đăng nhập):`, err);
      }
      setReviews(revData.data ?? []);
      setReviewsPagination(revData.pagination ?? { page: 1, totalPages: 1 });

      let distData = [];
      try {
        const distRes = await getHotelRatingDistributionApi(hotelId);
        distData = distRes.data?.data ?? distRes.data ?? [];
      } catch (err) {
        console.warn(`Lỗi lấy phân bổ rating cho hotel ${hotelId} (chưa đăng nhập):`, err);
      }
      setRatingDistribution(distData);
    } catch (err) {
      console.error("Lỗi khi tải đánh giá khách sạn:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId) {
      fetchReviewsData(reviewsPage);
    }
  }, [hotelId, reviewsPage]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitReviewError("");
    setSubmitReviewSuccess("");
    setIsSubmittingReview(true);

    try {
      const payload = {
        bookingCode: reviewBookingCode.trim(),
        rating: Number(newRating),
        content: newComment.trim(),
      };

      const res = await createReviewApi(payload);
      console.log("Submit review response:", res);

      setSubmitReviewSuccess("Gửi đánh giá thành công! Cảm ơn bạn.");
      setNewComment("");
      setReviewBookingCode("");
      setNewRating(5);

      // Reload reviews and rating stats
      setReviewsPage(1);
      fetchReviewsData(1);

      // Callback báo cho component cha cập nhật lại điểm số trung bình ở header
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      console.error("Lỗi khi gửi đánh giá:", err);
      setSubmitReviewError(
        err.response?.data?.error?.message ||
          "Có lỗi xảy ra khi gửi đánh giá. Vui lòng kiểm tra lại mã đặt phòng!"
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="border-t border-gray-300 my-15 py-10 mt-16">
      <h3 className="text-2xl font-playfair text-gray-800 font-medium mb-8">
        Đánh giá từ khách hàng
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* CỘT TRÁI: TỔNG QUAN ĐIỂM SỐ */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Điểm số tổng quan</h4>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl font-bold text-gray-800">
              {ratingStats.avgRating > 0 ? ratingStats.avgRating.toFixed(1) : "0.0"}
            </span>
            <div>
              <div className="flex items-center gap-1">
                <StarRating rating={Math.round(ratingStats.avgRating)} />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Dựa trên {ratingStats.totalReviews} lượt đánh giá
              </p>
            </div>
          </div>

          {/* BẢNG PHÂN BỔ ĐIỂM SỐ */}
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const countObj = ratingDistribution.find((d) => d.rating === star);
              const count = countObj ? countObj.count : 0;
              const percentage =
                ratingStats.totalReviews > 0
                  ? Math.round((count / ratingStats.totalReviews) * 100)
                  : 0;

              return (
                <div key={star} className="flex items-center text-sm gap-2">
                  <span className="w-3 text-gray-600 font-medium">{star}</span>
                  <span className="text-gray-400">★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="w-10 text-right text-gray-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CỘT GIỮA VÀ PHẢI: DANH SÁCH REVIEW & VIẾT REVIEW */}
        <div className="lg:col-span-2 space-y-10">
          {/* PHẦN DANH SÁCH REVIEW */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-800">Ý kiến khách hàng</h4>

            {reviewsLoading ? (
              <p className="text-gray-500">Đang tải đánh giá...</p>
            ) : reviews.length === 0 ? (
              <p className="text-gray-500">Chưa có đánh giá nào cho khách sạn này.</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {rev.userId ? "KH" : "AD"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {rev.userId ? `Khách hàng Nestbook` : `Khách hàng ẩn danh`}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <StarRating rating={rev.rating} />
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-4 text-sm leading-relaxed">
                      {rev.content}
                    </p>
                  </div>
                ))}

                {/* PHÂN TRANG REVIEWS */}
                {reviewsPagination.totalPages > 1 && (
                  <div className="flex items-center gap-2 mt-6">
                    <button
                      disabled={reviewsPage === 1}
                      onClick={() => setReviewsPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white cursor-pointer"
                    >
                      Trước
                    </button>
                    <span className="text-xs text-gray-500">
                      Trang {reviewsPage} / {reviewsPagination.totalPages}
                    </span>
                    <button
                      disabled={reviewsPage === reviewsPagination.totalPages}
                      onClick={() => setReviewsPage((p) => Math.min(reviewsPagination.totalPages, p + 1))}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white cursor-pointer"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FORM VIẾT REVIEW MỚI */}
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Chia sẻ trải nghiệm của bạn</h4>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã đặt phòng (đã thanh toán) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: NB2026..."
                    required
                    value={reviewBookingCode}
                    onChange={(e) => setReviewBookingCode(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Điểm đánh giá <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="text-2xl outline-none focus:outline-none transition-colors"
                      >
                        <span className={newRating >= star ? "text-orange-400" : "text-gray-300"}>
                          ★
                        </span>
                      </button>
                    ))}
                    <span className="text-sm text-gray-500 ml-2">({newRating}/5 sao)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bình luận đánh giá <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Hãy chia sẻ nhận xét chi tiết về dịch vụ khách sạn..."
                  required
                  rows="4"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none bg-white focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              {submitReviewError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
                  ⚠ {submitReviewError}
                </div>
              )}

              {submitReviewSuccess && (
                <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                  ✓ {submitReviewSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded text-sm transition-all cursor-pointer disabled:bg-gray-400"
              >
                {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomReviews;
