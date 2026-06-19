import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { confirmPaymentApi, getBookingByCodeApi } from "../services/publicService";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingCode = searchParams.get("bookingCode");
  const amount = searchParams.get("amount");

  // Các bước: 1 (Chờ thanh toán) -> 2 (Đang xử lý) -> 3 (Thành công)
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    if (!bookingCode) {
      navigate("/");
    }
  }, [bookingCode, navigate]);

  const handleMockPayment = async () => {
    setError("");
    setStep(2); // Chuyển sang màn hình Loading

    try {

      await confirmPaymentApi(bookingCode);

      // Tải thông tin đặt phòng chi tiết để hiển thị trên hóa đơn
      try {
        const res = await getBookingByCodeApi(bookingCode);
        const data = res.data?.data ?? res.data;
        setBookingDetails(data);
      } catch (fetchErr) {
        console.error("Lỗi tải chi tiết đặt phòng sau thanh toán:", fetchErr);
      }

      setStep(3); // Chuyển sang màn hình thành công
    } catch (err) {
      console.error("Lỗi xác nhận thanh toán:", err);
      setError(
        err.response?.data?.error?.message ||
        "Thanh toán thất bại! Vui lòng thử lại.",
      );
      setStep(1);
    }
  };

  if (!bookingCode) return null;

  return (
    <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32 flex justify-center bg-gray-50 min-h-screen">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-fit">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 text-center">
          <h2 className="text-2xl font-bold font-playfair tracking-wide">
            NestBook Secure Pay
          </h2>
          <p className="text-sm opacity-80 mt-1">Cổng thanh toán giả lập</p>
        </div>

        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              ⚠ {error}
            </div>
          )}

          {/* BƯỚC 1: XÁC NHẬN THANH TOÁN */}
          {step === 1 && (
            <div className="flex flex-col items-center">
              <div className="w-full border border-gray-200 rounded-lg p-5 mb-6 bg-gray-50">
                <div className="flex justify-between border-b border-gray-200 pb-3 mb-3">
                  <span className="text-gray-500">Mã Đặt Phòng:</span>
                  <span className="font-semibold text-gray-800">
                    {bookingCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Tổng tiền cần thanh toán:
                  </span>
                  <span className="font-bold text-blue-600 text-lg">
                    {Number(amount || 0).toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>

              <button
                onClick={handleMockPayment}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-lg transition-all shadow-md cursor-pointer"
              >
                Xác nhận Thanh toán
              </button>
            </div>
          )}

          {/* BƯỚC 2: LOADING */}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">
                Đang xử lý thanh toán...
              </p>
            </div>
          )}

          {/* BƯỚC 3: THÀNH CÔNG */}
          {step === 3 && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Thanh toán thành công!
              </h3>
              <p className="text-gray-500 text-sm mb-6 text-center">
                Đặt phòng của bạn đã được xác nhận. Vui lòng kiểm tra hóa đơn chi tiết bên dưới.
              </p>

              {/* HÓA ĐƠN CHI TIẾT (PRINTABLE / SCREENSHOT RECEIPT) */}
              <div id="nestbook-receipt" className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-5 mb-6 shadow-sm relative">
                {/* Decorative Half-circles on left and right borders for ticket feel */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-gray-50 border-r-2 border-dashed border-gray-300 rounded-r-full -ml-[2px]"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-gray-50 border-l-2 border-dashed border-gray-300 rounded-l-full -mr-[2px]"></div>

                <div className="text-center border-b pb-4 mb-4">
                  <h4 className="text-lg font-extrabold text-blue-700 tracking-wider">NESTBOOK RECEIPT</h4>
                  <p className="text-xs text-gray-400 mt-1">Cảm ơn bạn đã lựa chọn NestBook</p>
                </div>

                <div className="space-y-3 text-sm text-gray-700 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Mã đặt phòng (Booking):</span>
                    <span className="font-mono font-bold text-gray-900">{bookingCode}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500 font-medium">Thời gian tạo:</span>
                    <span className="text-gray-900">{bookingDetails?.createdAt ? new Date(bookingDetails.createdAt).toLocaleString("vi-VN") : new Date().toLocaleString("vi-VN")}</span>
                  </div>

                  <h5 className="font-semibold text-gray-800 pt-2 text-xs uppercase tracking-wider">Thông tin khách hàng</h5>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Họ và tên:</span>
                      <span className="font-medium text-gray-900">{bookingDetails?.customerName || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium text-gray-900">{bookingDetails?.customerEmail || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Số điện thoại:</span>
                      <span className="font-medium text-gray-900">{bookingDetails?.customerPhone || "N/A"}</span>
                    </div>
                  </div>

                  <h5 className="font-semibold text-gray-800 pt-2 text-xs uppercase tracking-wider">Thông tin phòng</h5>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{bookingDetails?.hotelName || "Khách sạn"}</p>
                      <p className="text-gray-500 text-xs">{bookingDetails?.roomTypeName || "Loại phòng"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-t pt-2 mt-1 text-xs">
                      <div>
                        <p className="text-gray-400">Check In</p>
                        <p className="font-medium text-gray-800">
                          {bookingDetails?.checkInDate ? new Date(bookingDetails.checkInDate).toLocaleDateString("vi-VN") : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Check Out</p>
                        <p className="font-medium text-gray-800">
                          {bookingDetails?.checkOutDate ? new Date(bookingDetails.checkOutDate).toLocaleDateString("vi-VN") : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs border-t pt-2">
                      <span className="text-gray-500">Thời lượng:</span>
                      <span className="font-medium text-gray-800">{bookingDetails?.nights} đêm x {bookingDetails?.quantity} phòng</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t-2 border-dashed border-gray-200">
                    <span className="text-gray-800 font-bold text-sm">Tổng thanh toán:</span>
                    <span className="text-blue-600 font-extrabold text-xl">
                      {Number(bookingDetails?.finalAmount || amount || 0).toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>
              </div>

              {!localStorage.getItem("token") && (
                <div className="w-full mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-sm text-left">
                  <p className="font-bold"> Lưu ý quan trọng:</p>
                  <p className="mt-1 text-xs">
                    Bạn đang đặt phòng với tư cách Khách chưa đăng nhập.
                    Vui lòng chụp ảnh màn hình hoặc bấm In hóa đơn để lưu trữ thông tin này. Bạn cần mã đặt phòng hoặc hóa đơn này để check-in tại khách sạn.
                  </p>
                </div>
              )}

              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={() => window.print()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  In / Lưu Hóa Đơn (PDF)
                </button>

                {localStorage.getItem("token") ? (
                  <button
                    onClick={() => navigate("/my-bookings")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all cursor-pointer text-sm"
                  >
                    Xem danh sách Đặt phòng
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all cursor-pointer text-sm"
                  >
                    Về trang chủ
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
