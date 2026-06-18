/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
// Tạm thời ẩn hàm getMeApi vì Backend chưa code xong API này
// import { getMeApi } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = () => {
      try {
        const token = localStorage.getItem("token");
        const savedUserStr = localStorage.getItem("user"); // Lấy cục data User đã lưu

        // Nếu không có token hoặc không có data user -> Chưa đăng nhập
        if (!token || !savedUserStr) {
          setLoading(false);
          return;
        }

        // Khôi phục lại toàn bộ thông tin User từ LocalStorage (giữ nguyên quyền HOTEL_OWNER)
        const userData = JSON.parse(savedUserStr);
        setUser(userData);
      } catch (error) {
        console.error("Lỗi khi khôi phục phiên đăng nhập:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (userData, token) => {
    // Lưu token
    localStorage.setItem("token", token);
    // LƯU THÊM: Ép kiểu Object User thành Chuỗi (String) để lưu vào LocalStorage
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    // Xóa sạch sẽ khi đăng xuất
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
