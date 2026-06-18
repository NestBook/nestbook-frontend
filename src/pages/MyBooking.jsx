import { useState } from "react";
import Title from "../components/Title";
import { assets, userBookingsDummyData } from "../assets/assets";

const MyBooking = () => {
  const [bookings] = useState(userBookingsDummyData);
  const currency = "$";

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="My Bookings"
        subTitle="Easily manage your past, current, and upcoming hotel reservations in one place. Plan your trips seamlessly with just a few clicks"
        align="left"
      />

      <div className="max-w-6xl mt-8 w-full text-gray-800">
        {/* Header của bảng - Chỉ hiển thị trên màn hình máy tính */}
        <div className="hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3">
          <p>Hotels</p>
          <p>Date & Timings</p>
          <p>Payment</p>
        </div>

        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 py-6 first:border-t"
          >
            {/* Cột 1: Thông tin khách sạn */}
            <div className="flex flex-col md:flex-row">
              <img
                src={booking.room.images[0]}
                alt="hotel-img"
                className=" min-md:w-44 rounded shadow object-cover"
              />
              <div className="flex flex-col gap-1.5 max-md:mt-3 md:ml-4">
                <p className="font-playfair text-2xl">
                  {booking.hotel.name}
                  <span className="font-inter text-sm ml-1">
                    ({booking.room.roomType})
                  </span>
                </p>
                {/* Địa chỉ */}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <img src={assets.locationIcon} alt="location" />
                  <span>{booking.hotel.address}</span>
                </div>
                {/* Số khách */}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <img src={assets.guestsIcon} alt="guests" />
                  <span>{booking.guests} Guests</span>
                </div>
                {/* Tổng tiền */}
                <p className="font-medium text-base mt-1">
                  Total: {currency}
                  {booking.totalPrice}
                </p>
              </div>
            </div>

            {/* Cột 2: Ngày nhận và trả phòng */}
            <div className="flex flex-row md:items-center md:gap-12 mt-3 gap-8">
              <div>
                <p className="font-medium text-gray-500">Check-in:</p>
                <p>{new Date(booking.checkInDate).toDateString()}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Check-out</p>
                <p>{new Date(booking.checkOutDate).toDateString()}</p>
              </div>
            </div>

            {/* Cột 3: Trạng thái thanh toán */}
            <div className="flex flex-col items-start justify-center pt-3">
              <div className="flex items-center gap-2">
                {/* Dấu chấm màu hiển thị trạng thái thanh toán */}
                <div
                  className={`w-3 h-3 rounded-full ${
                    booking.isPaid ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <p
                  className={`text-sm font-medium ${
                    booking.isPaid ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {booking.isPaid ? "Paid" : "Unpaid"}
                </p>
              </div>

              {/* Nút thanh toán (chỉ hiện khi chưa thanh toán) */}
              {!booking.isPaid && (
                <button className="py-1.5 px-4 mt-4 text-xs border border-gray-400 rounded-full hover:bg-gray-50 transition-all cursor-pointer">
                  Pay Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBooking;
