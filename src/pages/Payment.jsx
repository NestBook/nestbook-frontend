import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { confirmPaymentApi } from "../services/publicService";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingCode = searchParams.get("bookingCode");
  const amount = searchParams.get("amount");

  // Các bước: 1 (Chờ thanh toán) -> 2 (Đang xử lý) -> 3 (Thành công)
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingCode) {
      navigate("/");
    }
  }, [bookingCode, navigate]);

  const handleMockPayment = async () => {
    setError("");
    setStep(2); // Chuyển sang màn hình Loading

    try {
      // Gọi API PATCH /bookings/:bookingCode/pay
      // Backend sẽ tự động: Chuyển status PAID -> Tạo Invoice -> Xóa Redis
      await confirmPaymentApi(bookingCode);

      setStep(3); // Chuyển sang màn hình thành công
    } catch (err) {
      console.error("Lỗi xác nhận thanh toán:", err);
      setError(
        err.response?.data?.error?.message ||
          "Thanh toán thất bại! Vui lòng thử lại.",
      );
      setStep(1); // Quay lại nút thanh toán để thử lại
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
            <div className="flex flex-col items-center text-center">
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
              <p className="text-gray-500 text-sm mb-6">
                Đặt phòng của bạn đã được xác nhận. Hóa đơn đã được tạo trên hệ
                thống.
              </p>

              <button
                onClick={() => navigate("/my-bookings")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all cursor-pointer"
              >
                Xem danh sách Đặt phòng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
