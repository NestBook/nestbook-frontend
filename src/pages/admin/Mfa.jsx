import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyMfaApi } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import { ROLES } from "../../constants/roles";

const Mfa = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const mfaToken = location.state?.mfaToken || "";
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!mfaToken) {
      navigate("/login", { replace: true });
    }
  }, [mfaToken, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setErrorMessage("Mã xác thực phải gồm 6 chữ số!");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await verifyMfaApi({ mfaToken, code });
      const payload = res?.data?.data || res?.data;

      if (!payload || !payload.accessToken) {
        throw new Error("Mã xác thực không hợp lệ!");
      }

      // Lọc quyền như Login.jsx
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

      login(payload.user, payload.accessToken);

      if (payload.user.role === ROLES.ADMIN) {
        navigate("/admin", { replace: true });
      } else if (payload.user.role === ROLES.HOTEL_OWNER) {
        navigate("/owner", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          "Mã xác nhận OTP không đúng hoặc đã hết hạn!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!mfaToken) return null;

  return (
    <div className="pt-32 pb-20 flex justify-center px-4 bg-gray-50 min-h-screen">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100 h-fit">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-3">
            🛡️
          </div>
          <h1 className="text-2xl font-semibold text-center text-gray-800">
            Xác thực 2 lớp (MFA)
          </h1>
          <p className="text-sm text-gray-500 text-center mt-2">
            Vui lòng mở ứng dụng Authenticator (Google/Microsoft) để lấy mã xác thực 6 chữ số.
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center border border-red-100">
            ⚠ {errorMessage}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="Mã gồm 6 chữ số (e.g. 123456)"
            required
            maxLength="6"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="w-full border border-gray-300 p-3.5 mb-6 rounded-lg text-center font-mono text-xl tracking-widest focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-lg text-white transition-all font-semibold shadow-md ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            }`}
          >
            {isLoading ? "Đang xác nhận..." : "Xác nhận mã OTP"}
          </button>
        </form>

        <button
          onClick={() => navigate("/login", { replace: true })}
          className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          Quay lại Đăng nhập
        </button>
      </div>
    </div>
  );
};

export default Mfa;
