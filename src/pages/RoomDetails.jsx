import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { assets } from "../assets/assets";
import StarRating from "../components/StarRating";
import {
  getHotelDetailApi,
  getHotelRoomTypesApi,
  bookingQuoteApi,
} from "../services/publicService";

// Helper Functions cho Validate Ngày
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

const RoomDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [hotel, setHotel] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [quoteResult, setQuoteResult] = useState(null);
  const [quoteError, setQuoteError] = useState("");
  const [isQuoting, setIsQuoting] = useState(false);

  // (NEW) State ngày tháng (Khởi tạo mặc định lấy từ URL tìm kiếm sang)
  const today = getTodayString();
  const [checkIn, setCheckIn] = useState(searchParams.get("checkInDate") || "");
  const [checkOut, setCheckOut] = useState(
    searchParams.get("checkOutDate") || "",
  );

  // (NEW) Hàm xử lý đổi ngày thông minh
  const handleCheckInChange = (e) => {
    const val = e.target.value;
    setCheckIn(val);

    // Nếu ngày Check-out đang có mà lại <= ngày Check-in mới thì tự đẩy lên
    if (checkOut && val >= checkOut) {
      setCheckOut(getNextDayString(val));
    }
  };

  useEffect(() => {
    const fetchHotelInfo = async () => {
      try {
        setLoading(true);
        const [hotelRes, roomsRes] = await Promise.all([
          getHotelDetailApi(id),
          getHotelRoomTypesApi(id),
        ]);

        const hotelData = hotelRes.data?.data ?? hotelRes.data;
        const roomsPayload = roomsRes.data?.data ?? roomsRes.data;

        const roomsArray = Array.isArray(roomsPayload)
          ? roomsPayload
          : roomsPayload?.roomTypes || [];

        const hotelImgs = (hotelData?.images ?? []).map(
          (img) => img?.url || img,
        );
        const roomImgs = roomsArray.flatMap((rt) =>
          (rt.images ?? []).map((img) => img?.url || img),
        );
        const allImages = [...new Set([...hotelImgs, ...roomImgs])];

        setHotel({ ...hotelData, _galleryImages: allImages });
        setRoomTypes(roomsArray);

        if (allImages.length > 0) {
          setMainImage(allImages[0]);
        } else {
          setMainImage("https://picsum.photos/800/500");
        }

        if (roomsArray.length > 0) {
          setSelectedRoomId(roomsArray[0].id);
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết khách sạn", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelInfo();
  }, [id]);

  const handleCheckQuote = async (e) => {
    e.preventDefault();
    setQuoteError("");
    setQuoteResult(null);
    setIsQuoting(true);

    try {
      const payload = {
        roomTypeId: selectedRoomId,
        quantity: Number(e.target.guests.value),
        checkInDate: checkIn, // Dùng state thay cho e.target
        checkOutDate: checkOut, // Dùng state thay cho e.target
      };

      const res = await bookingQuoteApi(payload);
      setQuoteResult(res.data?.data ?? res.data);
    } catch (error) {
      setQuoteError(
        error.response?.data?.error?.message ||
          "Hết phòng trong thời gian này, vui lòng chọn ngày khác!",
      );
    } finally {
      setIsQuoting(false);
    }
  };

  if (loading)
    return (
      <div className="py-30 text-center text-gray-500">
        Đang tải thông tin...
      </div>
    );
  if (!hotel)
    return <div className="py-30 text-center">Không tìm thấy khách sạn!</div>;

  const hotelImages = hotel._galleryImages ?? [];

  return (
    <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
        <h1 className="text-3xl md:text-4xl font-playfair">{hotel.name}</h1>
        <p className="text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full">
          20% OFF
        </p>
      </div>

      <div className="flex items-center gap-1 mt-2">
        <StarRating rating={hotel.averageRating || 5} />
        <p className="ml-2">{hotel.reviewCount || 0} Reviews</p>
      </div>

      <div className="flex items-center gap-1 text-gray-500 mt-2">
        <img src={assets.locationIcon} alt="location-icon" />
        <span>
          {hotel.address}, {hotel.city}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row mt-6 gap-6">
        <div className="lg:w-1/2 w-full">
          <img
            src={mainImage}
            alt="Main Hotel"
            className="w-full h-[400px] rounded-xl shadow-lg object-cover"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full h-[400px] overflow-y-auto">
          {hotelImages.map((img, index) => (
            <img
              onClick={() => setMainImage(img)}
              key={index}
              src={img}
              alt="Hotel thumbnail"
              className={`w-full h-48 rounded-xl shadow-md object-cover cursor-pointer ${
                mainImage === img ? "outline-3 outline-orange-500" : ""
              }`}
            />
          ))}
        </div>
      </div>

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
              className="border border-gray-300 rounded px-3 py-2.5 outline-none bg-white"
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
              min={today} // (NEW) Khóa check-in từ hôm nay
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
              } // (NEW) Check-out động
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
              min="1"
              required
              defaultValue={searchParams.get("quantity") || 1}
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
          <div className="mt-6 p-6 bg-white rounded shadow-sm border border-green-200">
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
            <div className="flex justify-between mt-4 text-xl font-bold text-gray-800">
              <span>Tổng thanh toán:</span>
              <span className="text-blue-600">
                {quoteResult.finalAmount?.toLocaleString("vi-VN")} đ
              </span>
            </div>

            <button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded text-lg transition-all">
              Tiếp tục Đặt phòng
            </button>
          </div>
        )}
      </div>

      <div className="max-w-3xl border-t border-gray-300 my-15 py-10 text-gray-500 mt-16">
        <h3 className="text-xl text-gray-800 font-medium mb-4">
          Mô tả khách sạn
        </h3>
        <p>{hotel.description || "Chưa có mô tả chi tiết."}</p>
      </div>
    </div>
  );
};

export default RoomDetails;
