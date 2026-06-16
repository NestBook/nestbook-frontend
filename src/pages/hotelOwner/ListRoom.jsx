// ListRoom.jsx
import { useState, useEffect } from "react";
import Title from "../../components/Title";
import {
  getOwnerHotelsApi,
  getRoomTypesApi,
  deleteRoomTypeApi,
  updateRoomTypeApi, // thêm vào ownerService.js
} from "../../services/ownerService";

const ListRoom = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage] = useState("");
  // State cho modal sửa
  const [editingRoom, setEditingRoom] = useState(null);
  const [editInputs, setEditInputs] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getOwnerHotelsApi()
      .then((res) => {
        const list = res.data?.data ?? res.data ?? [];
        setHotels(list);
        if (list.length > 0) setSelectedHotelId(String(list[0].id));
      })
      .catch(() => setError("Không thể tải danh sách khách sạn."));
  }, []);

  useEffect(() => {
    if (!selectedHotelId) return;
    const fetchRooms = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await getRoomTypesApi(selectedHotelId);
        const roomData = res.data?.data ?? res.data ?? [];
        setRooms(Array.isArray(roomData) ? roomData : []);
      } catch {
        setError("Không thể tải danh sách phòng.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, [selectedHotelId]);

  const handleEdit = (room) => {
    setEditingRoom(room);
    setEditInputs({
      name: room.name ?? "",
      bedType: room.bedType ?? "King",
      price: room.price ?? "",
      totalQuantity: room.totalQuantity ?? "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRoom) return;
    setIsSaving(true);
    try {
      await updateRoomTypeApi(editingRoom.id, {
        name: editInputs.name,
        bedType: editInputs.bedType,
        price: Number(editInputs.price),
        totalQuantity: Number(editInputs.totalQuantity),
      });
      // Cập nhật local state luôn, không cần refetch
      setRooms((prev) =>
        prev.map((r) =>
          r.id === editingRoom.id
            ? {
                ...r,
                name: editInputs.name,
                bedType: editInputs.bedType,
                price: Number(editInputs.price),
                totalQuantity: Number(editInputs.totalQuantity),
              }
            : r,
        ),
      );
      setEditingRoom(null);
    } catch {
      setError("Không thể cập nhật phòng.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xác nhận xóa loại phòng này?")) return;
    try {
      await deleteRoomTypeApi(id);
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Không thể xóa phòng này.");
    }
  };

  return (
    <div>
      <Title
        align="left"
        font="outfit"
        title="Room Listings"
        subtitle="Manage and view the list of rooms in your hotel."
      />

      {hotels.length > 1 && (
        <select
          value={selectedHotelId}
          onChange={(e) => setSelectedHotelId(e.target.value)}
          className="mt-6 border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500"
        >
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      )}

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded mt-4 text-sm border border-red-100">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 text-green-500 p-3 rounded mt-4 text-sm border border-green-100">
          {successMessage}
        </div>
      )}

      <p className="text-gray-600 mt-6">All Rooms</p>

      <div className="w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-96 overflow-y-scroll mt-3">
        {isLoading ? (
          <p className="text-center text-gray-400 py-10 text-sm">Đang tải...</p>
        ) : rooms.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">
            Chưa có phòng nào. Hãy thêm phòng mới!
          </p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-gray-800 font-medium text-left">
                  Name
                </th>
                <th className="py-3 px-4 text-gray-800 font-medium text-left max-sm:hidden">
                  Amenities
                </th>
                <th className="py-3 px-4 text-gray-800 font-medium text-center">
                  Price / night
                </th>
                <th className="py-3 px-4 text-gray-800 font-medium text-center">
                  Qty
                </th>
                <th className="py-3 px-4 text-gray-800 font-medium text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300">
                    {room.name || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300 max-sm:hidden">
                    {(room.amenities ?? []).join(", ") || "—"}
                  </td>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300 text-center">
                    {(room.price ?? room.pricePerNight)?.toLocaleString(
                      "vi-VN",
                    ) ?? 0}{" "}
                    đ
                  </td>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300 text-center">
                    {room.totalQuantity ?? 0}
                  </td>
                  <td className="py-3 px-4 border-t border-gray-300 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEdit(room)}
                        className="text-blue-500 hover:text-blue-700 text-xs transition"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="text-red-500 hover:text-red-700 text-xs transition"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Sửa */}
      {/* Modal Sửa */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-base font-semibold text-gray-800 mb-5">
              Sửa phòng: {editingRoom.name}
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-gray-800 mb-1">Tên phòng</p>
                <input
                  type="text"
                  value={editInputs.name}
                  onChange={(e) =>
                    setEditInputs({ ...editInputs, name: e.target.value })
                  }
                  className="border border-gray-300 mt-1 rounded p-2 w-full text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-800 mb-1">Bed Type</p>
                  <select
                    value={editInputs.bedType}
                    onChange={(e) =>
                      setEditInputs({ ...editInputs, bedType: e.target.value })
                    }
                    className="border border-gray-300 rounded p-2 w-full text-sm text-gray-700 opacity-70 focus:outline-none focus:border-blue-500"
                  >
                    {["Single", "Double", "Queen", "King", "Twin"].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-800 mb-1">
                    Price
                    <span className="text-xs text-gray-500">/night (VNĐ)</span>
                  </p>
                  <input
                    type="number"
                    min="0"
                    value={editInputs.price}
                    onChange={(e) =>
                      setEditInputs({
                        ...editInputs,
                        price: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded p-2 w-full text-sm text-gray-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 mb-1">
                    Quantity
                    <span className="text-xs text-gray-500"> (Rooms)</span>
                  </p>
                  <input
                    type="number"
                    min="1"
                    value={editInputs.totalQuantity}
                    onChange={(e) =>
                      setEditInputs({
                        ...editInputs,
                        totalQuantity: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded p-2 w-full text-sm text-gray-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingRoom(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className={`px-4 py-2 text-sm text-white rounded transition ${
                  isSaving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListRoom;
