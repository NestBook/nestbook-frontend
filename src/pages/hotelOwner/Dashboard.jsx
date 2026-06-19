import { useState, useEffect, useMemo } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import { getOwnerBookingsApi } from "../../services/ownerService";

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getOwnerBookingsApi();
        // Dữ liệu trả về từ Backend (BookingResponse[])
        setBookings(res.data?.data ?? res.data ?? []);
      } catch (err) {
        console.error("Lỗi tải dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Tính toán số liệu thực tế từ danh sách Booking
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const totalRevenue = bookings
      .filter((b) => b.paymentStatus === "PAID")
      .reduce((acc, curr) => acc + Number(curr.finalAmount), 0);
    return { totalBookings, totalRevenue };
  }, [bookings]);

  return (
    <div>
      <Title
        align="left"
        font="outfit"
        title="Dashboard"
        subtitle="Quản lý lượt đặt phòng và doanh thu."
      />

      {loading ? (
        <div className="my-8 text-gray-500">Đang tải dữ liệu...</div>
      ) : (
        <>
          <div className="flex gap-4 my-8">
            {/* Thẻ Tổng số lượt đặt phòng */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-4 p-4 pr-8">
              <img
                className="max-sm:hidden h-10 w-10 object-contain"
                src={assets.totalBookingIcon}
                alt="Total Bookings"
              />
              <div>
                <p className="text-blue-500 text-sm font-medium">
                  Total Bookings
                </p>
                <p className="text-neutral-700 text-2xl font-semibold">
                  {stats.totalBookings}
                </p>
              </div>
            </div>

            {/* Thẻ Tổng doanh thu */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-4 p-4 pr-8">
              <img
                className="max-sm:hidden h-10 w-10 object-contain"
                src={assets.totalRevenueIcon}
                alt="Total Revenue"
              />
              <div>
                <p className="text-blue-500 text-sm font-medium">
                  Total Revenue
                </p>
                <p className="text-neutral-700 text-2xl font-semibold">
                  {stats.totalRevenue.toLocaleString("vi-VN")} đ
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-xl text-blue-950/70 font-medium mb-5">
            Recent Bookings
          </h2>

          <div className="w-full max-w-4xl text-left border border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-gray-800 font-medium">
                    User Name
                  </th>
                  <th className="py-3 px-4 text-gray-800 font-medium max-sm:hidden">
                    Room Name
                  </th>
                  <th className="py-3 px-4 text-gray-800 font-medium text-center">
                    Amount
                  </th>
                  <th className="py-3 px-4 text-gray-800 font-medium text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📭</span>
                        <p className="text-gray-400">
                          Chưa có dữ liệu đặt phòng
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-blue-50/40 transition-all duration-200"
                    >
                      {/* Customer */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {booking.guestName?.charAt(0)?.toUpperCase() || "G"}
                          </div>

                          <div>
                            <p className="font-medium text-gray-800">
                              {booking.guestName || "Guest"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {booking.guestEmail}
                            </p>

                            <p className="text-xs text-gray-400">
                              {booking.guestPhone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Room */}
                      <td className="py-4 px-5 max-sm:hidden">
                        <div>
                          <p className="font-medium text-gray-800">
                            {booking.roomTypeName || "Room"}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {booking.checkInDate}
                          </p>

                          <p className="text-xs text-gray-500">
                            {booking.checkOutDate}
                          </p>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-5 text-center">
                        <div>
                          <p className="font-semibold text-green-600">
                            {Number(booking.finalAmount).toLocaleString(
                              "vi-VN",
                            )}{" "}
                            đ
                          </p>

                          <p className="text-xs text-gray-400">
                            {booking.nights} đêm
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            booking.paymentStatus === "PAID"
                              ? "bg-green-100 text-green-700"
                              : booking.paymentStatus === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {booking.paymentStatus === "PAID"
                            ? " Paid"
                            : booking.paymentStatus === "PENDING"
                              ? " Pending"
                              : " Failed"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
