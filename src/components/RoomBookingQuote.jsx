import { useState, useEffect } from "react";
import { bookingQuoteApi, createBookingApi } from "../services/publicService";

const getTodayString = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getNextDayString = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const RoomBookingQuote = ({ hotelId, roomTypes, searchParams, navigate }) => {
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [quoteResult, setQuoteResult] = useState(null);
  const [quoteError, setQuoteError] = useState("");
  const [isQuoting, setIsQuoting] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const today = getTodayString();
  const [checkIn, setCheckIn] = useState(searchParams.get("checkInDate") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOutDate") || "");
  const [quantity, setQuantity] = useState(searchParams.get("quantity") || 1);

  // States lưu thông tin khách hàng để gửi cho Backend
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    if (roomTypes && roomTypes.length > 0) {
      setSelectedRoomId(roomTypes[0].id);
    }
  }, [roomTypes]);

  const handleCheckInChange = (e) => {
    const val = e.target.value;
    setCheckIn(val);
    if (checkOut && val >= checkOut) {
      setCheckOut(getNextDayString(val));
    }
  };

  const handleCheckQuote = async (e) => {
    e.preventDefault();
    setQuoteError("");
    setQuoteResult(null);
    setIsQuoting(true);

    console.log("=== GỬI YÊU CẦU BÁO GIÁ ===");
    const payload = {
      roomTypeId: selectedRoomId,
      quantity: Number(quantity),
      checkInDate: `${checkIn}T14:00:00.000Z`,
      checkOutDate: `${checkOut}T12:00:00.000Z`,
    };
    console.log("Payload:", payload);

    try {
      const res = await bookingQuoteApi(payload);
      console.log("Response từ backend:", res);
      const data = res.data?.data ?? res.data;
      console.log("Dữ liệu báo giá bóc tách được:", data);

      setQuoteResult(data);
      if (data && data.canBook === false) {
        setQuoteError("Hết phòng trống trong khoảng thời gian này!");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API báo giá:", error);
      setQuoteError(
        error.response?.data?.error?.message ||
          "Hết phòng trong thời gian này, vui lòng chọn ngày khác!",
      );
    } finally {
      setIsQuoting(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setIsBooking(true);
    try {
      const payload = {
        roomTypeId: selectedRoomId,
        quantity: Number(quantity),
        checkInDate: `${checkIn}T14:00:00.000Z`,
        checkOutDate: `${checkOut}T12:00:00.000Z`,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
      };

      const res = await createBookingApi(payload);
      const bookingData = res.data?.data ?? res.data;
      const bookingCode = bookingData.bookingCode || bookingData.id;

      alert("Tạo Booking thành công! Chuyển tới trang thanh toán...");
      navigate(
        `/payment?bookingCode=${bookingCode}&amount=${quoteResult.finalAmount}`,
      );
    } catch (error) {
      console.error("Lỗi đặt phòng:", error);
      alert(
        error.response?.data?.error?.message ||
          "Có lỗi xảy ra khi tạo Đặt phòng. Vui lòng thử lại!",
      );
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="mt-16 bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h2 className="text-2xl font-playfair mb-6">
        Booking Quote (Kiểm tra báo giá)
      </h2>

      <form
        onSubmit={handleCheckQuote}
        className="flex flex-col md:flex-row items-start md:items-end gap-4 text-gray-700"
      >
        <div className="flex flex-col flex-1">
          <label className="font-medium text-sm mb-1">Loại phòng</label>
          <select
            className="border border-gray-300 rounded px-3 py-2.5 outline-none bg-white w-full"
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            required
          >
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name} - {rt.price?.toLocaleString("vi-VN")} đ/đêm
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">Check-In</label>
          <input
            type="date"
            id="checkInDate"
            required
            min={today}
            value={checkIn}
            onChange={handleCheckInChange}
            className="border border-gray-300 rounded px-3 py-2.5 outline-none bg-white"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">Check-Out</label>
          <input
            type="date"
            id="checkOutDate"
            required
            min={
              checkIn ? getNextDayString(checkIn) : getNextDayString(today)
            }
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2.5 outline-none bg-white"
          />
        </div>

        <div className="flex flex-col w-24">
          <label className="font-medium text-sm mb-1">Số lượng</label>
          <input
            type="number"
            id="guests"
            name="guests"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2.5 outline-none bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={isQuoting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-8 rounded transition-all cursor-pointer disabled:bg-gray-400"
        >
          {isQuoting ? "Đang tính..." : "Báo Giá"}
        </button>
      </form>

      {quoteError && (
        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded border border-red-200">
          ⚠ {quoteError}
        </div>
      )}

      {quoteResult && quoteResult.canBook !== false && (
        <div className="mt-6 p-6 bg-white rounded shadow-sm border border-green-200 flex flex-col md:flex-row items-stretch justify-between gap-8">
          <div className="flex-1 w-full">
            <h3 className="text-lg font-semibold text-green-700 mb-4">
              Phòng còn trống!
            </h3>
            <div className="flex justify-between border-b pb-2 mb-2 text-gray-600">
              <span>Giá mỗi đêm:</span>
              <span>
                {quoteResult.pricePerNight?.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div className="flex justify-between border-b pb-2 mb-2 text-gray-600">
              <span>Số đêm lưu trú:</span>
              <span>x {quoteResult.nights} đêm</span>
            </div>
            <div className="flex justify-between border-b pb-2 mb-2 text-gray-600">
              <span>Số lượng phòng:</span>
              <span>x {quoteResult.quantity} phòng</span>
            </div>
            <div className="flex justify-between border-b pb-2 mb-2 text-gray-600">
              <span>Số phòng còn trống:</span>
              <span className="text-green-600 font-semibold">{quoteResult.availableQuantity} phòng</span>
            </div>
            <div className="flex justify-between mt-4 text-xl font-bold text-gray-800">
              <span>Tổng thanh toán:</span>
              <span className="text-blue-600">
                {quoteResult.finalAmount?.toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>

          {/* FORM ĐIỀN THÔNG TIN KHÁCH HÀNG */}
          <form
            onSubmit={handleCreateBooking}
            className="w-full md:w-[320px] shrink-0 md:pl-8 md:border-l border-gray-200 flex flex-col gap-3"
          >
            <h4 className="text-sm font-semibold text-gray-800 mb-1">
              Thông tin liên hệ
            </h4>
            <input
              type="text"
              placeholder="Họ và tên"
              required
              maxLength="150"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              type="email"
              placeholder="Email"
              required
              maxLength="255"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              type="tel"
              placeholder="Số điện thoại"
              required
              maxLength="30"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={isBooking}
              className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition-all shadow-sm disabled:bg-gray-400"
            >
              {isBooking ? "Đang xử lý..." : "Đặt Ngay"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RoomBookingQuote;
