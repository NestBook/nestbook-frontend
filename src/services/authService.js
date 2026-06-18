import axiosClient from "../api/axiosClient";

export const loginApi = (data) => {
  return axiosClient.post("/auth/login", data);
};

export const getMeApi = () => {
  return axiosClient.get("/auth/me");
};

export const verifyMfaApi = (data) => {
  return axiosClient.post("/auth/admin/mfa/verify", data);
};

// Hàm mới cho Google Login
export const googleLoginApi = (data) => {
  return axiosClient.post("/auth/google-login", data);
};
export const registerApi = (data) => {
  return axiosClient.post("/auth/register", data);
};
