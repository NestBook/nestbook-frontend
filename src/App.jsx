import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public Pages
import Home from "./pages/Home";
import AllRooms from "./pages/AllRooms";
import RoomDetails from "./pages/RoomDetails";
import MyBooking from "./pages/MyBooking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Payment from "./pages/Payment";

// Owner Pages
import OwnerLayout from "./pages/hotelOwner/Layout";
import OwnerDashboard from "./pages/hotelOwner/Dashboard";
import AddRoom from "./pages/hotelOwner/AddRoom";
import ListRoom from "./pages/hotelOwner/ListRoom";
import Availability from "./pages/hotelOwner/Availability";

// Admin Pages
import AdminLayout from "./pages/admin/Layout";
import AdminDashboard from "./pages/admin/Dashboard";
import Hotels from "./pages/admin/Hotels";
import AssignOwner from "./pages/admin/AssignOwner";
import Mfa from "./pages/admin/Mfa";
import AdminReviews from "./pages/admin/Reviews";

// Route Guards
import ProtectedRoute from "./components/auth/ProtectedRoute";
import OwnerRoute from "./components/auth/OwnerRoute";
import AdminRoute from "./components/auth/AdminRoute";

const App = () => {
  const location = useLocation();

  const isOwnerPath = location.pathname.startsWith("/owner");
  const isAdminPath = location.pathname.startsWith("/admin");

  const hideNavbarFooter = isOwnerPath || isAdminPath;

  return (
    <div>
      {!hideNavbarFooter && <Navbar />}

      <div className="min-h-[70vh]">
        <Routes>
          {/* ================= PUBLIC ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<AllRooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/mfa" element={<Mfa />} />

          {/* ================= CUSTOMER ================= */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBooking />
              </ProtectedRoute>
            }
          />
          <Route path="/payment" element={<Payment />} />

          {/* ================= OWNER ================= */}
          <Route
            path="/owner"
            element={
              <OwnerRoute>
                <OwnerLayout />
              </OwnerRoute>
            }
          >
            <Route index element={<OwnerDashboard />} />
            <Route path="add-room" element={<AddRoom />} />
            <Route path="list-room" element={<ListRoom />} />
            <Route path="availability" element={<Availability />} />
          </Route>

          {/* ================= ADMIN ================= */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />

            {/* Hotel CRUD */}
            <Route path="hotels" element={<Hotels />} />

            {/* Reviews Moderation */}
            <Route path="reviews" element={<AdminReviews />} />

            {/* Assign Owner */}
            <Route
              path="hotels/:hotelId/assign-owner"
              element={<AssignOwner />}
            />
          </Route>
        </Routes>
      </div>

      {!hideNavbarFooter && <Footer />}
    </div>
  );
};

export default App;
