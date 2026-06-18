import { useEffect, useState } from "react";
import {
  getHotelsApi,
  createHotelApi,
  updateHotelApi,
  deleteHotelApi,
  assignHotelOwnerApi,
  getOwnersListApi,
  assignUserRoleApi,
  uploadHotelImageApi,
} from "../../services/adminService";

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);

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

  // State lưu file ảnh và link xem trước
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const loadHotels = async () => {
    try {
      setLoading(true);
      const res = await getHotelsApi();
      setHotels(res.data?.data ?? res.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  const loadOwners = async () => {
    try {
      const res = await getOwnersListApi();
      setOwnersList(res.data?.data ?? res.data ?? []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách Owner:", error);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  // Hàm xử lý khi người dùng chọn ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Hàm reset form
  const resetForm = () => {
    setForm({ name: "", city: "", address: "", phone: "", description: "" });
    setImageFile(null);
    setImagePreview("");
    setEditingHotel(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const hotelPayload = {
        name: form.name,
        city: form.city,
        address: form.address,
        phone: form.phone,
        description: form.description,
      };

      if (editingHotel) {
        // --- CHẾ ĐỘ EDIT: UPDATE TEXT VÀ UPLOAD ẢNH ---
        // 1. Cập nhật thông tin text
        await updateHotelApi(editingHotel.id, hotelPayload);

        // 2. Nếu admin có đính kèm ảnh mới thì up lên
        if (imageFile) {
          const uploadData = new FormData();
          uploadData.append("file", imageFile);
          await uploadHotelImageApi(editingHotel.id, uploadData);
        }
        alert("Cập nhật thông tin và hình ảnh thành công!");
      } else {
        // --- CHẾ ĐỘ CREATE: CHỈ TẠO KHUNG TEXT ---
        await createHotelApi(hotelPayload);
        alert("Thêm khách sạn thành công! Vui lòng bấm 'Edit' để tải ảnh lên.");
      }

      resetForm();
      loadHotels();
    } catch (error) {
      console.error("Lỗi lưu khách sạn:", error);
      alert("Có lỗi xảy ra khi lưu khách sạn! Hãy kiểm tra Console.");
    }
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

    // Hiển thị ảnh cũ nếu có
    setImageFile(null);
    const existingImage = hotel.images?.[0]?.url || hotel.images?.[0] || "";
    setImagePreview(existingImage);

    // Cuộn lên đầu trang để admin dễ thao tác
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khách sạn này?")) return;
    await deleteHotelApi(id);
    loadHotels();
  };

  const handleOpenAssignModal = (hotel) => {
    setAssigningHotel(hotel);
    loadOwners();
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOwnerId) {
      alert("Vui lòng chọn một Owner!");
      return;
    }

    try {
      await assignHotelOwnerApi(assigningHotel.id, selectedOwnerId);
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

          {/* CHỈ HIỆN KHU VỰC UP ẢNH KHI ĐANG Ở CHẾ ĐỘ EDIT */}
          {editingHotel && (
            <div className="md:col-span-2 flex flex-col md:flex-row gap-6 items-start border border-dashed border-gray-300 p-4 rounded-lg mt-2 bg-gray-50 transition-all duration-300">
              <div className="flex-1 w-full">
                <p className="text-gray-800 text-sm font-medium mb-2">
                  Ảnh đại diện Khách sạn
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Định dạng hỗ trợ: JPG, PNG, WEBP.
                </p>
              </div>

              {/* Vùng xem trước ảnh */}
              {imagePreview && (
                <div className="w-full md:w-48 h-32 relative rounded overflow-hidden shadow-sm border border-gray-200 bg-white">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}
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

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            className="px-6 py-2 rounded text-white text-sm bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-md transition-all font-medium"
          >
            {editingHotel ? "UPDATE & UPLOAD" : "CREATE HOTEL"}
          </button>

          {editingHotel && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 rounded text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 transition-all font-medium"
            >
              Hủy / Đóng
            </button>
          )}
        </div>
      </form>

      {/* BẢNG DANH SÁCH */}
      <p className="text-gray-600 mb-3">All Hotels</p>

      <div className="w-full text-left border border-gray-300 rounded-lg overflow-hidden bg-white">
        {loading ? (
          <p className="text-center text-gray-400 py-10 text-sm">Đang tải...</p>
        ) : hotels.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">
            Chưa có khách sạn nào.
          </p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
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
                <tr key={hotel.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      {hotel.images?.[0] ? (
                        <img
                          src={hotel.images[0].url || hotel.images[0]}
                          className="w-10 h-10 rounded object-cover border border-gray-200"
                          alt="thumbnail"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          No Img
                        </div>
                      )}
                      <span className="font-medium">{hotel.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-200 max-sm:hidden">
                    {hotel.city}
                  </td>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-200 max-sm:hidden">
                    {hotel.phone}
                  </td>
                  <td className="py-3 px-4 border-t border-gray-200 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEdit(hotel)}
                        className="text-blue-500 hover:text-blue-700 text-xs font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenAssignModal(hotel)}
                        className="text-green-500 hover:text-green-700 text-xs font-medium transition"
                      >
                        Owner
                      </button>
                      <button
                        onClick={() => handleDelete(hotel.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium transition"
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

      {/* MODAL GÁN OWNER */}
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
