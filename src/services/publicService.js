import axiosClient from "../api/axiosClient";

// --- KHÁCH SẠN (HOTELS) ---
export const getHotelsApi = () => {
  return axiosClient.get("/hotels");
};

export const searchHotelsApi = (params) => {
  return axiosClient.get("/hotels/search", {
    params,
  });
};

export const getHotelDetailApi = (id) => {
  return axiosClient.get(`/hotels/${id}`);
};

export const getHotelRoomTypesApi = (id) => {
  return axiosClient.get(`/hotels/${id}/room-types`);
};

// --- ĐẶT PHÒNG (BOOKINGS) ---
// API tính giá tạm tính
export const bookingQuoteApi = (payload) => {
  return axiosClient.post("/bookings/quote", payload);
};

// API tạo đơn đặt phòng (Pending)
export const createBookingApi = (payload) => {
  const token = localStorage.getItem("token");
  if (token) {
    return axiosClient.post("/bookings", payload);
  } else {
    return axiosClient.post("/bookings/guest", payload);
  }
};

// API lấy chi tiết đặt phòng
export const getBookingByCodeApi = (bookingCode) => {
  return axiosClient.get(`/bookings/${bookingCode}`);
};

// API Hủy đặt phòng
export const cancelBookingApi = (bookingCode, reason) => {
  return axiosClient.patch(`/bookings/${bookingCode}/cancel`, { reason });
};

// API XÁC NHẬN THANH TOÁN (Trọng tâm của luồng Payment)
// API này gọi Backend để: Đổi status sang CONFIRMED + Sinh Invoice tự động
export const confirmPaymentApi = (bookingCode) => {
  return axiosClient.patch(`/bookings/${bookingCode}/pay`);
};

// --- HÓA ĐƠN (INVOICES) ---
// Lấy hóa đơn theo mã (Dùng để hiển thị sau khi đã thanh toán)
export const getInvoiceByCodeApi = (invoiceCode) => {
  return axiosClient.get(`/invoices/${invoiceCode}`);
};
export const getMyBookingsApi = () => {
  return axiosClient.get("/bookings/user/me");
};

// --- ĐÁNH GIÁ (REVIEWS) ---
export const getHotelReviewsApi = (hotelId, params = {}) => {
  return axiosClient.get(`/hotels/${hotelId}/reviews`, { params });
};

export const getHotelRatingApi = (hotelId) => {
  return axiosClient.get(`/hotels/${hotelId}/rating`);
};

export const getHotelRatingDistributionApi = (hotelId) => {
  return axiosClient.get(`/hotels/${hotelId}/rating-distribution`);
};

export const createReviewApi = (payload) => {
  return axiosClient.post("/reviews", payload);
};
