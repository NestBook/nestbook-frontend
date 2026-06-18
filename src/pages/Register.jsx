import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../services/authService";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);

    try {
      // ĐÃ SỬA Ở ĐÂY: Gửi lên "fullName" để khớp với Backend
      await registerApi({ fullName: name, email, password });

      setSuccessMessage(
        "Đăng ký thành công! Đang chuyển hướng đến trang Đăng nhập...",
      );

      // Đợi 2 giây để user đọc thông báo rồi chuyển về Login
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          "Đăng ký thất bại. Email có thể đã tồn tại!",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 flex justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow border border-gray-100">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Đăng ký tài khoản
        </h1>

        {errorMessage && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm text-center">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm text-center">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Họ và tên"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-3 mb-4 rounded focus:outline-none focus:border-black"
          />

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 mb-4 rounded focus:outline-none focus:border-black"
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 mb-4 rounded focus:outline-none focus:border-black"
          />

          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border p-3 mb-6 rounded focus:outline-none focus:border-black"
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded text-white transition-all ${
              isLoading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {isLoading ? "Đang xử lý..." : "Đăng ký ngay"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
