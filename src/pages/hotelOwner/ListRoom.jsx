import { useState, useEffect } from "react";
import Title from "../../components/Title";
import {
  getOwnerHotelsApi,
  getRoomTypesApi,
  deleteRoomTypeApi,
  updateRoomTypeApi,
  uploadRoomImageApi,
} from "../../services/ownerService";

const ListRoom = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // State cho modal sửa
  const [editingRoom, setEditingRoom] = useState(null);
  const [editInputs, setEditInputs] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // State lưu file ảnh phòng (nhiều ảnh)
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

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

    let cancelled = false;
    setIsLoading(true);
    setError("");

    getRoomTypesApi(selectedHotelId)
      .then((res) => {
        if (cancelled) return;
        const roomData = res.data?.data ?? res.data ?? [];
        setRooms(Array.isArray(roomData) ? roomData : []);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Không thể tải danh sách phòng.");
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedHotelId, refreshKey]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setImageFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      isExisting: false,
    }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemovePreview = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    // Chỉ xóa trong imageFiles nếu là ảnh mới (không phải ảnh cũ)
    const existingCount = imagePreviews.filter((p) => p.isExisting).length;
    const newFileIndex = index - existingCount;
    if (newFileIndex >= 0) {
      setImageFiles((prev) => prev.filter((_, i) => i !== newFileIndex));
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setEditInputs({
      name: room.name ?? "",
      bedType: room.bedType ?? "King",
      price: room.price ?? "",
      totalQuantity: room.totalQuantity ?? "",
    });
    setImageFiles([]);
    const existingPreviews = (room.images ?? []).map((img) => ({
      url: img?.url || img || "",
      isExisting: true,
    }));
    setImagePreviews(existingPreviews);
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

      if (imageFiles.length > 0) {
        await Promise.all(
          imageFiles.map((file) => {
            const uploadData = new FormData();
            uploadData.append("file", file);
            return uploadRoomImageApi(editingRoom.id, uploadData);
          }),
        );
      }

      setEditingRoom(null);
      setImageFiles([]);
      setImagePreviews([]);
      setRefreshKey((k) => k + 1);
    } catch {
      setError("Không thể cập nhật phòng hoặc tải ảnh lên.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa loại phòng này?")) return;
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
                <tr key={room.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300">
                    <div className="flex items-center gap-3">
                      {room.images?.[0] ? (
                        <img
                          src={room.images[0].url || room.images[0]}
                          className="w-10 h-10 rounded object-cover border border-gray-200"
                          alt="room"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          No Img
                        </div>
                      )}
                      <span className="font-medium">{room.name || "N/A"}</span>
                    </div>
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
                        Sửa & Up Ảnh
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
      {editingRoom && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-base font-semibold text-gray-800 mb-5">
              Sửa phòng:{" "}
              <span className="text-blue-600">{editingRoom.name}</span>
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
                      setEditInputs({ ...editInputs, price: e.target.value })
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

              {/* Khu vực up ảnh nhiều ảnh */}
              <div className="mt-2 border border-dashed border-gray-300 p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-800 font-medium mb-2">
                  Ảnh loại phòng
                  <span className="text-xs text-gray-400 ml-1">
                    (có thể chọn nhiều ảnh)
                  </span>
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative rounded overflow-hidden border border-gray-200 shadow-sm aspect-square"
                      >
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePreview(index)}
                          className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none hover:bg-red-500 transition"
                        >
                          ×
                        </button>
                        {preview.isExisting && (
                          <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-black/40 text-white py-0.5">
                            Hiện tại
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingRoom(null);
                  setImageFiles([]);
                  setImagePreviews([]);
                }}
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
                {isSaving ? "Đang lưu..." : "Lưu & Tải ảnh"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListRoom;
