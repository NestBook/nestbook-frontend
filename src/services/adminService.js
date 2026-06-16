import axiosClient from "../api/axiosClient";

export const getHotelsApi = () => {
  return axiosClient.get("/admin/hotels");
};

export const getHotelByIdApi = (id) => {
  return axiosClient.get(`/admin/hotels/${id}`);
};

export const createHotelApi = (data) => {
  return axiosClient.post("/admin/hotels", data);
};

export const updateHotelApi = (id, data) => {
  return axiosClient.patch(`/admin/hotels/${id}`, data);
};

export const deleteHotelApi = (id) => {
  return axiosClient.delete(`/admin/hotels/${id}`);
};

export const assignHotelOwnerApi = (hotelId, ownerId) => {
  return axiosClient.patch(`/admin/hotels/${hotelId}/owner`, {
    ownerId,
  });
};

export const getOwnersListApi = () => {
  return axiosClient.get("/users");
};
// Thêm API cấp quyền cho User
export const assignUserRoleApi = (userId, roleIds) => {
  return axiosClient.put(`/users/${userId}/roles`, { roleIds });
};
