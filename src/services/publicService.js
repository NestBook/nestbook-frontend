import axiosClient from "../api/axiosClient";

// Gọi toàn bộ danh sách khách sạn (Dùng cho Trang chủ)
export const getHotelsApi = () => {
  return axiosClient.get("/hotels");
};

// Tìm kiếm khách sạn theo ngày/thành phố (Dùng cho Trang Search)

// Lấy chi tiết 1 khách sạn
export const getHotelDetailApi = (id) => {
  return axiosClient.get(`/hotels/${id}`);
};

// Lấy danh sách loại phòng của 1 khách sạn
export const getHotelRoomTypesApi = (id) => {
  return axiosClient.get(`/hotels/${id}/room-types`);
};

// API Báo giá (Booking Quote)
export const bookingQuoteApi = (payload) => {
  return axiosClient.post("/bookings/quote", payload);
};
export const searchHotelsApi = (params) => {
  return axiosClient.get("/hotels/search", {
    params,
  });
};
