import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";

import { getMyBookingsApi, getHotelRoomTypesApi } from "../services/publicService";

const MyBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getMyBookingsApi();
        const rawBookings = res.data?.data ?? res.data ?? [];

        // Cache for hotel room types to prevent redundant API requests
        const hotelCache = {};

        const resolvedBookings = await Promise.all(
          rawBookings.map(async (booking) => {
            let hotelName = booking.hotelName;
            let roomTypeName = booking.roomTypeName;
            let imageUrl = "";

            try {
              if (!hotelCache[booking.hotelId]) {
                const detailsRes = await getHotelRoomTypesApi(booking.hotelId);
                hotelCache[booking.hotelId] = detailsRes.data?.data ?? detailsRes.data;
              }
              const data = hotelCache[booking.hotelId];
              if (data) {
                if (!hotelName && data.hotel) {
                  hotelName = data.hotel.name;
                }
                if (data.roomTypes) {
                  const matchedRoom = data.roomTypes.find(
                    (r) => String(r.id) === String(booking.roomTypeId)
                  );
                  if (matchedRoom) {
                    if (!roomTypeName) {
                      roomTypeName = matchedRoom.name;
                    }
                    if (matchedRoom.images && matchedRoom.images.length > 0) {
                      const firstImg = matchedRoom.images[0];
                      imageUrl = firstImg?.url || firstImg;
                    }
                  }
                  // Fallback: If no image found for current room type, use the first room type's image
                  if (!imageUrl && data.roomTypes.length > 0) {
                    const firstRoom = data.roomTypes[0];
                    if (firstRoom.images && firstRoom.images.length > 0) {
                      const firstImg = firstRoom.images[0];
                      imageUrl = firstImg?.url || firstImg;
                    }
                  }
                }
              }
            } catch (err) {
              console.error(`Lỗi khi giải quyết thông tin đặt phòng cho hotel ${booking.hotelId}:`, err);
            }

            return {
              ...booking,
              hotelName: hotelName || "Khách sạn",
              roomTypeName: roomTypeName || "Loại phòng",
              imageUrl: imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945",
            };
          })
        );

        setBookings(resolvedBookings);
      } catch (error) {
        console.error("Lỗi tải danh sách booking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getPaymentBadge = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-red-100 text-red-700";
    }


  };

  return (<div className="py-28 md:pt-32 md:pb-20 px-4 md:px-12 lg:px-24"> <Title
    title="My Bookings"
    subTitle="Quản lý tất cả đơn đặt phòng của bạn"
    align="left"
  />


    {loading ? (
      <div className="flex justify-center py-20">
        <div className="text-gray-500">
          Đang tải dữ liệu...
        </div>
      </div>
    ) : bookings.length === 0 ? (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center mt-8">
        <div className="text-5xl mb-4"></div>

        <h3 className="text-xl font-semibold text-gray-700">
          Chưa có đơn đặt phòng nào
        </h3>

        <p className="text-gray-500 mt-2">
          Hãy bắt đầu đặt phòng cho chuyến đi tiếp theo của bạn.
        </p>
      </div>
    ) : (
      <div className="space-y-6 mt-8">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            <div className="grid md:grid-cols-[260px_1fr]">
              {/* IMAGE */}
              <img
                src={booking.imageUrl}
                alt={booking.hotelName}
                className="w-full h-64 md:h-full object-cover"
              />

              {/* CONTENT */}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {booking.hotelName || "Khách sạn"}
                      </h2>

                      <p className="text-gray-500 mt-1">
                        {booking.roomTypeName || "Loại phòng"}
                      </p>

                      <p className="text-sm text-gray-400 mt-2">
                        Mã đặt phòng:
                        <span className="font-medium ml-1">
                          {booking.bookingCode}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-4 py-1 rounded-full text-sm font-medium ${getPaymentBadge(
                          booking.paymentStatus,
                        )}`}
                      >
                        {booking.paymentStatus}
                      </span>

                      <span className="text-xs text-gray-500">
                        {booking.bookingStatus}
                      </span>
                    </div>
                  </div>

                  {/* THÔNG TIN KHÁCH */}
                  <div className="mt-5 bg-gray-50 rounded-xl p-4">
                    <p className="font-semibold text-gray-800">
                      {booking.customerName}
                    </p>

                    <p className="text-sm text-gray-500">
                      {booking.customerEmail}
                    </p>

                    <p className="text-sm text-gray-500">
                      {booking.customerPhone}
                    </p>
                  </div>

                  {/* THÔNG TIN LƯU TRÚ */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div>
                      <p className="text-xs uppercase text-gray-400">
                        Check In
                      </p>

                      <p className="font-medium text-gray-700">
                        {new Date(
                          booking.checkInDate,
                        ).toLocaleDateString("vi-VN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-gray-400">
                        Check Out
                      </p>

                      <p className="font-medium text-gray-700">
                        {new Date(
                          booking.checkOutDate,
                        ).toLocaleDateString("vi-VN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-gray-400">
                        Lưu trú
                      </p>

                      <p className="font-medium text-blue-600">
                        {booking.nights} đêm
                      </p>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-between items-center flex-wrap gap-4 mt-8">
                  <div>
                    <p className="text-sm text-gray-400">
                      Tổng thanh toán
                    </p>

                    <p className="text-3xl font-bold text-green-600">
                      {Number(
                        booking.finalAmount,
                      ).toLocaleString("vi-VN")}{" "}
                      đ
                    </p>
                  </div>

                  {booking.paymentStatus === "PENDING" && (
                    <button
                      onClick={() =>
                        navigate(
                          `/payment?bookingCode=${booking.bookingCode}&amount=${booking.finalAmount}`,
                        )
                      }
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all"
                    >
                      Thanh toán ngay
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>


  );
};

export default MyBooking;
