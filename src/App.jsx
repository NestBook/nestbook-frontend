import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import AllRooms from "./pages/AllRooms";
import RoomDetails from "./pages/RoomDetails";
import MyBooking from "./pages/MyBooking";
import Login from "./pages/Login";

// Owner Pages
import Layout from "./pages/hotelOwner/Layout";
import Dashboard from "./pages/hotelOwner/Dashboard";
import AddRoom from "./pages/hotelOwner/AddRoom";
import ListRoom from "./pages/hotelOwner/ListRoom";

// Route Guards
import ProtectedRoute from "./components/auth/ProtectedRoute";
import OwnerRoute from "./components/auth/OwnerRoute";

const App = () => {
  const location = useLocation();
  // Giấu Navbar ở các trang của Owner (Owner có Sidebar riêng trong Layout)
  const isOwnerPath = location.pathname.startsWith("/owner");

  return (
    <div>
      {/* Chỉ render Navbar ở giao diện Public/Customer */}
      {!isOwnerPath && <Navbar />}

      <div className="min-h-[70vh]">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<AllRooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/login" element={<Login />} />

          {/* Customer / Protected Routes */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBooking />
              </ProtectedRoute>
            }
          />

          {/* Hotel Owner Routes */}
          <Route
            path="/owner"
            element={
              <OwnerRoute>
                <Layout />
              </OwnerRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="add-room" element={<AddRoom />} />
            <Route path="list-room" element={<ListRoom />} />
          </Route>
        </Routes>
      </div>

      {!isOwnerPath && <Footer />}
    </div>
  );
};

export default App;
