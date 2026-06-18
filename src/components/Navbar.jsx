import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAuth } from "../contexts/AuthContext";

const BookIcon = () => (
  <svg
    className="w-4 h-4 text-current"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4"
    />
  </svg>
);

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
    { name: "Experiences", path: "/experiences" },
    { name: "About", path: "/about" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Xử lý scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname !== "/") {
        setIsScrolled(true);
      } else {
        setIsScrolled(window.scrollY > 10);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${
        isScrolled
          ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4"
          : "py-4 md:py-6"
      }`}
    >
      {/* Logo */}
      <Link to="/">
        <img
          src={assets.logo12}
          alt="logo"
          className={`h-7 object-contain ${isScrolled ? "invert opacity-80" : ""}`}
        />
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-4 lg:gap-8">
        {navLinks.map((link, i) => (
          <Link
            key={i}
            to={link.path}
            className={`group flex flex-col gap-0.5 ${
              isScrolled ? "text-gray-700" : "text-white"
            }`}
          >
            {link.name}
            <div
              className={`${
                isScrolled ? "bg-gray-700" : "bg-white"
              } h-0.5 w-0 group-hover:w-full transition-all duration-300`}
            />
          </Link>
        ))}

        {/* Nút Dashboard hiển thị theo Role */}
        {user?.role === "HOTEL_OWNER" && (
          <button
            className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer ${
              isScrolled ? "text-black border-black" : "text-white border-white"
            } transition-all`}
            onClick={() => navigate("/owner")}
          >
            Owner Dashboard
          </button>
        )}

        {user?.role === "ADMIN" && (
          <button
            className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer ${
              isScrolled ? "text-black border-black" : "text-white border-white"
            } transition-all`}
            onClick={() => navigate("/admin")}
          >
            Admin Dashboard
          </button>
        )}
      </div>

      {/* Desktop Right (Search & Auth) */}
      <div className="hidden md:flex items-center gap-4">
        <img
          src={assets.searchIcon}
          alt="search"
          className={`${
            isScrolled ? "invert" : ""
          } h-7 transition-all duration-500`}
        />

        {user ? (
          // Custom User Dropdown - ĐÃ CĂN CHỈNH KIỂU CHỮ
          <div className="relative ml-4" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 py-1.5 px-3 rounded-full transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                {user.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="max-w-[120px] truncate text-sm font-medium text-gray-800 pr-1">
                {user.fullName || "User"}
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 flex flex-col z-50">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/my-bookings");
                  }}
                  className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors text-left"
                >
                  <BookIcon /> My Bookings
                </button>

                <div className="h-px bg-gray-100 w-auto mx-4 my-1" />

                <button
                  onClick={handleLogout}
                  className="flex items-center px-5 py-2.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-black text-white px-8 py-2.5 rounded-full ml-4 hover:bg-gray-800 transition-all duration-500"
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3 md:hidden">
        <img
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          src={assets.menuIcon}
          alt="menu"
          className={`${isScrolled ? "invert" : ""} h-4 cursor-pointer`}
        />
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 z-50 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="absolute top-4 right-4"
          onClick={() => setIsMenuOpen(false)}
        >
          <img src={assets.closeIcon} alt="close" className="h-6.5" />
        </button>

        {navLinks.map((link, i) => (
          <Link
            key={i}
            to={link.path}
            onClick={() => setIsMenuOpen(false)}
            className="text-xl"
          >
            {link.name}
          </Link>
        ))}

        {user && (
          <>
            {user.role === "HOTEL_OWNER" && (
              <button
                className="border border-gray-800 px-6 py-2 rounded-full transition-all"
                onClick={() => {
                  navigate("/owner");
                  setIsMenuOpen(false);
                }}
              >
                Owner Dashboard
              </button>
            )}
            {user.role === "ADMIN" && (
              <button
                className="border border-gray-800 px-6 py-2 rounded-full transition-all"
                onClick={() => {
                  navigate("/admin");
                  setIsMenuOpen(false);
                }}
              >
                Admin Dashboard
              </button>
            )}
            <button
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mt-2"
              onClick={() => {
                navigate("/my-bookings");
                setIsMenuOpen(false);
              }}
            >
              <BookIcon /> My Bookings
            </button>
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="text-red-500 hover:text-red-600 font-medium mt-4 transition-colors"
            >
              Logout
            </button>
          </>
        )}

        {!user && (
          <button
            onClick={() => {
              navigate("/login");
              setIsMenuOpen(false);
            }}
            className="bg-black text-white px-10 py-3 rounded-full transition-all mt-4"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
