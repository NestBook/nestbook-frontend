import { useState } from "react";
import Title from "../../components/Title";

import { assets, dashboardDummyData } from "../../assets/assets";

const Dashboard = () => {
  const [dashboardData] = useState(dashboardDummyData);

  return (
    <div>
      <Title
        align="left"
        font="outfit"
        title="dashboard"
        subtitle="Manage your hotel bookings and revenue from here."
      />

      <div className="flex gap-4 my-8">
        {/* Thẻ Tổng số lượt đặt phòng */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-4 p-4 pr-8">
          <img
            className="max-sm:hidden h-10 w-10 object-contain"
            src={assets.totalBookingIcon}
            alt="Total Bookings"
          />
          <div>
            <p className="text-blue-500 text-sm font-medium">Total Bookings</p>
            <p className="text-neutral-700 text-2xl font-semibold">
              {dashboardData.totalBookings}
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
            <p className="text-blue-500 text-sm font-medium">Total Revenue</p>
            <p className="text-neutral-700 text-2xl font-semibold">
              ${dashboardData.totalRevenue}
            </p>
          </div>
        </div>
      </div>

      {/* Tiêu đề danh sách các lượt đặt phòng gần đây */}
      <h2 className="text-xl text-blue-950/70 font-medium mb-5">
        Recent Bookings
      </h2>

      {/* Bảng hiển thị danh sách đặt phòng */}
      <div className="w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-scroll">
        <table className="w-full ">
          <thead className="bg-gray-50 b">
            <tr>
              <th className="py-3 px-4 text-gray-800 font-medium">User Name</th>
              <th className="py-3 px-4 text-gray-800 font-medium max-sm:hidden">
                Room Name
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">
                Total Amount
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">
                Payment Status
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {dashboardData.bookings.map((item, index) => (
              <tr key={index} className="border-b last:border-none">
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300">
                  {item.user.username}
                </td>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300 max-sm:hidden">
                  {item.room.roomType}
                </td>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300 text-center">
                  $ {item.totalPrice}
                </td>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300 flex">
                  {/* Nút trạng thái thanh toán với màu sắc thay đổi theo tình trạng */}
                  <button
                    className={`px-3 py-1 rounded-full text-xs mx-auto ${item.isPaid ? "bg-green-100 text-green-600" : "bg-amber-100 text-yellow-600"}`}
                  >
                    {item.isPaid ? "Completed" : "Pending"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
