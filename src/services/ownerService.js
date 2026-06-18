import axiosClient from "../api/axiosClient";

// 1. API Upload ảnh lên MinIO (ĐÃ SỬA THÀNH /resource)
export const uploadFileApi = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("ownerType", "ROOM_TYPE");
  // ownerId là optional theo contract nên tạm thời không cần truyền

  return axiosClient.post("/resource", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 2. API Tạo loại phòng (Room Type)
export const createRoomTypeApi = (data) => {
  return axiosClient.post("/owner/room-types", data);
};
export const getOwnerHotelsApi = () => {
  return axiosClient.get("/owner/hotels");
};
export const updateRoomTypeApi = (id, data) => {
  return axiosClient.patch(`/owner/room-types/${id}`, data);
};
// Lấy danh sách room type theo hotelId
export const getRoomTypesApi = (hotelId) => {
  return axiosClient.get("/owner/room-types", { params: { hotelId } });
};

// Xóa room type
export const deleteRoomTypeApi = (id) => {
  return axiosClient.delete(`/owner/room-types/${id}`);
};
// Thêm hàm này vào file ownerService.js
export const uploadRoomImageApi = (roomId, formData) => {
  return axiosClient.post(`/owner/room-types/${roomId}/images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
// --- QUẢN LÝ AVAILABILITY ---

export const getAvailabilityBlocksApi = ({
  roomTypeId,
  checkInDate,
  checkOutDate,
  quantity = 1,
}) => {
  return axiosClient.get("/owner/availability", {
    params: {
      roomTypeId,
      checkInDate,
      checkOutDate,
      quantity,
    },
  });
};

export const createAvailabilityBlockApi = (data) => {
  return axiosClient.post("/owner/availability-blocks", data);
};

export const deleteAvailabilityBlockApi = (blockId) => {
  return axiosClient.delete(`/owner/availability-blocks/${blockId}`);
};
export const getOwnerBookingsApi = () => {
  return axiosClient.get("/owner/bookings");
};
