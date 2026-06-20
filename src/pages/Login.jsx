import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginApi, googleLoginApi } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import { ROLES } from "../constants/roles";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await loginApi({ email, password });

      const payload = res?.data?.data || res?.data;

      if (!payload || (!payload.accessToken && !payload.requiresMfa)) {
        throw new Error("Invalid response - Không tìm thấy Access Token");
      }

      // --- BẮT ĐẦU ĐOẠN XỬ LÝ LỌC QUYỀN (ROLE) Ở FRONTEND ---
      if (!payload.user) {
        payload.user = { role: "CUSTOMER" };
      } else {

        if (payload.user.roles && payload.user.roles.length > 0) {
          const firstRole = payload.user.roles[0];

          payload.user.role = firstRole.code || firstRole || "CUSTOMER";
        }

        else if (!payload.user.role) {
          payload.user.role = "CUSTOMER";
        }
      }
      // --- KẾT THÚC ĐOẠN XỬ LÝ LỌC QUYỀN ---

      if (payload.requiresMfa) {
        navigate("/admin/mfa", { state: { mfaToken: payload.mfaToken } });
        return;
      }

      processLoginSuccess(payload);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Sai email hoặc mật khẩu!",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log(" Google Trả Về:", credentialResponse);

    if (!credentialResponse || !credentialResponse.credential) {
      setErrorMessage(
        "Bị Google chặn lại! Vui lòng làm mới trang hoặc dùng Tab ẩn danh.",
      );
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await googleLoginApi({
        provider: "GOOGLE",
        providerToken: credentialResponse.credential,
      });

      console.log("📦 Dữ liệu Backend trả về:", res.data);

      const payload = res?.data?.data || res?.data;

      if (!payload || !payload.accessToken) {
        throw new Error("Invalid response - Missing accessToken");
      }

      // --- BẮT ĐẦU ĐOẠN XỬ LÝ LỌC QUYỀN (ROLE) Ở FRONTEND ---
      if (!payload.user) {
        payload.user = { role: "CUSTOMER" };
      } else {
        if (payload.user.roles && payload.user.roles.length > 0) {
          const firstRole = payload.user.roles[0];
          payload.user.role = firstRole.code || firstRole || "CUSTOMER";
        } else if (!payload.user.role) {
          payload.user.role = "CUSTOMER";
        }
      }
      // --- KẾT THÚC ĐOẠN XỬ LÝ LỌC QUYỀN ---

      processLoginSuccess(payload);
    } catch (error) {
      console.error("Lỗi từ Backend:", error);
      setErrorMessage("Dữ liệu từ server trả về không đúng định dạng!");
    } finally {
      setIsLoading(false);
    }
  };

  const processLoginSuccess = (payload) => {
    login(payload.user, payload.accessToken);

    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
    } else if (payload.user.role === ROLES.ADMIN) {
      navigate("/admin", { replace: true });
    } else if (payload.user.role === ROLES.HOTEL_OWNER) {
      navigate("/owner", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="pt-32 pb-20 flex justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow border border-gray-100">
        <h1 className="text-2xl font-semibold text-center mb-6">Đăng nhập</h1>

        {errorMessage && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleStandardLogin}>
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
            className="w-full border p-3 mb-6 rounded focus:outline-none focus:border-black"
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded text-white transition-all ${isLoading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
              }`}
          >
            {isLoading ? "Đang xử lý..." : "Đăng nhập hệ thống"}
          </button>
        </form>

        <div className="mt-6 mb-6 flex items-center justify-between">
          <span className="border-b w-1/4"></span>
          <span className="text-xs text-gray-500 uppercase">
            Hoặc dành cho khách
          </span>
          <span className="border-b w-1/4"></span>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setErrorMessage("Google Popup bị đóng hoặc xảy ra lỗi mạng.");
            }}
            useOneTap={false}
          />
        </div>
        <p className="mt-8 text-center text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
