import { useEffect, useState } from "react";
import {
  getHotelsApi,
  createHotelApi,
  updateHotelApi,
  deleteHotelApi,
  assignHotelOwnerApi,
  getOwnersListApi, // Đừng quên import hàm mới này
  assignUserRoleApi, // Import hàm cấp quyền mới
} from "../../services/adminService";

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);

  // State quản lý việc gán Owner
  const [assigningHotel, setAssigningHotel] = useState(null);
  const [ownersList, setOwnersList] = useState([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState("");

  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    description: "",
  });

  const loadHotels = async () => {
    try {
      setLoading(true);
      const res = await getHotelsApi();
      setHotels(res.data?.data ?? res.data ?? []); // Bắt nhiều trường hợp res.data
    } finally {
      setLoading(false);
    }
  };

  // Hàm load danh sách Owner khi mở Modal
  const loadOwners = async () => {
    try {
      const res = await getOwnersListApi();
      // Điều chỉnh đoạn này tùy theo cấu trúc dữ liệu Backend trả về
      setOwnersList(res.data?.data ?? res.data ?? []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách Owner:", error);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingHotel) {
      await updateHotelApi(editingHotel.id, form);
    } else {
      await createHotelApi(form);
    }
    setForm({ name: "", city: "", address: "", phone: "", description: "" });
    setEditingHotel(null);
    loadHotels();
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setForm({
      name: hotel.name ?? "",
      city: hotel.city ?? "",
      address: hotel.address ?? "",
      phone: hotel.phone ?? "",
      description: hotel.description ?? "",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete hotel?")) return;
    await deleteHotelApi(id);
    loadHotels();
  };

  // Logic xử lý khi bấm nút "Owner"
  const handleOpenAssignModal = (hotel) => {
    setAssigningHotel(hotel);
    loadOwners();
  };

  // Logic xử lý khi xác nhận gán Owner trong Modal
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOwnerId) {
      alert("Vui lòng chọn một Owner!");
      return;
    }

    try {
      // 1. Gọi API Gán Khách sạn (như cũ)
      await assignHotelOwnerApi(assigningHotel.id, selectedOwnerId);

      // 2. GỌI THÊM API CẤP QUYỀN OWNER CHO USER NÀY
      // LƯU Ý QUAN TRỌNG: Bạn cần thay số "2" thành đúng số ID của quyền HOTEL_OWNER trong DB
      // Ví dụ: Nếu trong bảng roles, HOTEL_OWNER có id là 3, thì sửa thành ["3"]
      await assignUserRoleApi(selectedOwnerId, ["2"]);

      alert("Đã gán Owner và cấp quyền Chủ Khách Sạn thành công!");
      setAssigningHotel(null);
      setSelectedOwnerId("");

      loadHotels();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi gán Owner!");
    }
  };

  return (
    <div className="relative">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Hotel Management
      </h1>

      {/* Form tạo / chỉnh sửa */}
      <form
        onSubmit={handleSubmit}
        className="border border-gray-200 rounded-lg p-6 mb-8 bg-white shadow-sm"
      >
        <p className="text-gray-800 font-medium mb-4">
          {editingHotel ? "Chỉnh sửa khách sạn" : "Thêm khách sạn mới"}
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-800 text-sm mb-1">Hotel Name</p>
            <input
              placeholder="e.g. Nest Hotel Hanoi"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-gray-300 mt-1 rounded p-2 w-full focus:outline-none focus:border-blue-500 text-sm"
              required
            />
          </div>

          <div>
            <p className="text-gray-800 text-sm mb-1">City</p>
            <input
              placeholder="e.g. Hanoi"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="border border-gray-300 mt-1 rounded p-2 w-full focus:outline-none focus:border-blue-500 text-sm"
              required
            />
          </div>

          <div>
            <p className="text-gray-800 text-sm mb-1">Address</p>
            <input
              placeholder="e.g. 123 Cau Giay, Hanoi"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="border border-gray-300 mt-1 rounded p-2 w-full focus:outline-none focus:border-blue-500 text-sm"
              required
            />
          </div>

          <div>
            <p className="text-gray-800 text-sm mb-1">Phone</p>
            <input
              placeholder="e.g. 0240000000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="border border-gray-300 mt-1 rounded p-2 w-full focus:outline-none focus:border-blue-500 text-sm"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-gray-800 text-sm mb-1">Description</p>
          <textarea
            placeholder="Hotel description..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="border border-gray-300 mt-1 rounded p-2 w-full focus:outline-none focus:border-blue-500 text-sm resize-none"
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            className="px-6 py-2 rounded text-white text-sm bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-md transition-all"
          >
            {editingHotel ? "UPDATE HOTEL" : "CREATE HOTEL"}
          </button>

          {editingHotel && (
            <button
              type="button"
              onClick={() => {
                setEditingHotel(null);
                setForm({
                  name: "",
                  city: "",
                  address: "",
                  phone: "",
                  description: "",
                });
              }}
              className="px-6 py-2 rounded text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 transition-all"
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      {/* Bảng danh sách */}
      <p className="text-gray-600 mb-3">All Hotels</p>

      <div className="w-full text-left border border-gray-300 rounded-lg overflow-hidden">
        {loading ? (
          <p className="text-center text-gray-400 py-10 text-sm">Đang tải...</p>
        ) : hotels.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">
            Chưa có khách sạn nào.
          </p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-gray-800 font-medium text-left">
                  Name
                </th>
                <th className="py-3 px-4 text-gray-800 font-medium text-left max-sm:hidden">
                  City
                </th>
                <th className="py-3 px-4 text-gray-800 font-medium text-left max-sm:hidden">
                  Phone
                </th>
                <th className="py-3 px-4 text-gray-800 font-medium text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {hotels.map((hotel) => (
                <tr key={hotel.id}>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300">
                    {hotel.name}
                  </td>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300 max-sm:hidden">
                    {hotel.city}
                  </td>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300 max-sm:hidden">
                    {hotel.phone}
                  </td>
                  <td className="py-3 px-4 border-t border-gray-300 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEdit(hotel)}
                        className="text-blue-500 hover:text-blue-700 text-xs transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenAssignModal(hotel)}
                        className="text-green-500 hover:text-green-700 text-xs transition"
                      >
                        Owner
                      </button>
                      <button
                        onClick={() => handleDelete(hotel.id)}
                        className="text-red-500 hover:text-red-700 text-xs transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- MODAL GÁN OWNER --- */}
      {assigningHotel && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              Gán Owner cho:{" "}
              <span className="text-blue-600">{assigningHotel.name}</span>
            </h3>

            <form onSubmit={handleAssignSubmit}>
              <p className="text-sm text-gray-600 mb-2">
                Chọn tài khoản Owner:
              </p>
              <select
                className="w-full border border-gray-300 rounded p-2 mb-6 focus:outline-none focus:border-blue-500"
                value={selectedOwnerId}
                onChange={(e) => setSelectedOwnerId(e.target.value)}
              >
                <option value="">-- Chọn Owner --</option>
                {ownersList.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.fullName || owner.email || owner.username} - ID:{" "}
                    {owner.id}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAssigningHotel(null);
                    setSelectedOwnerId("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Xác nhận Gán
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hotels;
