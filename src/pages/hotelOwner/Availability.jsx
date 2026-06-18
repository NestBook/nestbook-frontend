import { useState, useEffect } from "react";
import Title from "../../components/Title";
import {
  getOwnerHotelsApi,
  getRoomTypesApi,
  getAvailabilityBlocksApi, // Dùng để CHECK
  createAvailabilityBlockApi, // Dùng để POST
} from "../../services/ownerService";

// --- Helper Functions ---
const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const getNextDayString = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const Availability = () => {
  const today = getTodayString();

  // --- STATE: CHỌN KHÁCH SẠN & PHÒNG ---
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");

  // --- CHỨC NĂNG 1: TRA CỨU AVAILABILITY ---
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(getNextDayString(today));
  const [checkQty, setCheckQty] = useState(1);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  // --- CHỨC NĂNG 2: KHÓA PHÒNG ---
  const [blockStart, setBlockStart] = useState(today);
  const [blockEnd, setBlockEnd] = useState(getNextDayString(today));
  const [blockQty, setBlockQty] = useState(1);
  const [reason, setReason] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);

  // 1. Tải danh sách Khách sạn
  useEffect(() => {
    getOwnerHotelsApi()
      .then((res) => {
        const list = res.data?.data ?? res.data ?? [];
        setHotels(list);
        if (list.length > 0) setSelectedHotelId(String(list[0].id));
      })
      .catch((err) => console.error(err));
  }, []);

  // 2. Tải danh sách Phòng khi chọn Khách sạn
  useEffect(() => {
    if (!selectedHotelId) return;
    getRoomTypesApi(selectedHotelId)
      .then((res) => {
        const roomData = res.data?.data ?? res.data ?? [];
        setRooms(roomData);
        if (roomData.length > 0) setSelectedRoomId(String(roomData[0].id));
        else setSelectedRoomId("");
        // Đổi phòng thì reset kết quả
        setAvailabilityResult(null);
      })
      .catch((err) => console.error(err));
  }, [selectedHotelId]);

  // --- XỬ LÝ: CHỨC NĂNG 1 (CHECK) ---
  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) return alert("Vui lòng chọn loại phòng!");

    setIsChecking(true);
    setAvailabilityResult(null);
    try {
      const res = await getAvailabilityBlocksApi({
        roomTypeId: selectedRoomId,
        checkInDate: `${checkIn}T14:00:00.000Z`,
        checkOutDate: `${checkOut}T12:00:00.000Z`,
        quantity: checkQty,
      });
      setAvailabilityResult(res.data?.data ?? res.data);
    } catch (err) {
      alert(err.response?.data?.error?.message || "Kiểm tra thất bại");
    } finally {
      setIsChecking(false);
    }
  };

  // --- XỬ LÝ: CHỨC NĂNG 2 (BLOCK) ---
  const handleBlockRoom = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) return alert("Vui lòng chọn loại phòng!");

    setIsBlocking(true);
    try {
      await createAvailabilityBlockApi({
        roomTypeId: selectedRoomId,
        startDate: `${blockStart}T14:00:00.000Z`,
        endDate: `${blockEnd}T12:00:00.000Z`,
        blockedQuantity: blockQty, // Khớp chính xác với DTO BE
        reason: reason || "Bảo trì",
      });

      alert("Khóa phòng thành công!");

      // Reset form khóa
      setReason("");
      setBlockStart(today);
      setBlockEnd(getNextDayString(today));
      setBlockQty(1);
    } catch (err) {
      alert(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "Khóa phòng thất bại",
      );
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <div>
      <Title
        align="left"
        font="outfit"
        title="Availability Checker & Block Room"
        subtitle="Tra cứu tình trạng phòng và tạo lịch đóng phòng."
      />

      {/* --- SELECT KHÁCH SẠN & PHÒNG --- */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mt-6 shadow-sm flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 w-full flex items-center gap-3">
          <label className="font-medium text-gray-700 min-w-24">
            Khách sạn:
          </label>
          <select
            value={selectedHotelId}
            onChange={(e) => setSelectedHotelId(e.target.value)}
            className="border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500 flex-1 bg-gray-50"
          >
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 w-full flex items-center gap-3">
          <label className="font-medium text-gray-700 min-w-24">
            Loại phòng:
          </label>
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500 flex-1 bg-gray-50"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mt-8 items-start">
        {/* --- CỘT 1: CHỨC NĂNG TRA CỨU --- */}
        <div className="border border-blue-200 bg-blue-50/30 rounded-lg p-6 shadow-sm h-fit">
          <h3 className="font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">
            1. Tra cứu tình trạng (Check)
          </h3>
          <form
            onSubmit={handleCheckAvailability}
            className="flex flex-col gap-4"
          >
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-700 block mb-1">
                  Từ ngày
                </label>
                <input
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (e.target.value >= checkOut)
                      setCheckOut(getNextDayString(e.target.value));
                  }}
                  className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-700 block mb-1">
                  Đến ngày
                </label>
                <input
                  type="date"
                  required
                  min={getNextDayString(checkIn)}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700 block mb-1">
                Số lượng yêu cầu
              </label>
              <input
                type="number"
                min="1"
                required
                value={checkQty}
                onChange={(e) => setCheckQty(Number(e.target.value))}
                className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isChecking || !selectedRoomId}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded text-sm font-medium transition disabled:bg-gray-400"
            >
              {isChecking ? "Đang xử lý..." : "Kiểm tra"}
            </button>
          </form>

          {/* HIỂN THỊ KẾT QUẢ CHECK */}
          {availabilityResult && (
            <div
              className={`mt-6 p-4 rounded-lg border ${
                availabilityResult.canBook
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <p
                    className={`font-semibold ${
                      availabilityResult.canBook
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {availabilityResult.canBook
                      ? "Có thể đặt phòng"
                      : "Không đủ phòng"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Số lượng còn trống</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {availabilityResult.available ?? 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- CỘT 2: CHỨC NĂNG KHÓA PHÒNG --- */}
        <div className="border border-red-200 bg-red-50/30 rounded-lg p-6 shadow-sm h-fit">
          <h3 className="font-semibold text-red-800 mb-4 border-b border-red-200 pb-2">
            2. Khóa phòng (Block)
          </h3>
          <form onSubmit={handleBlockRoom} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-700 block mb-1">
                  Khóa từ ngày
                </label>
                <input
                  type="date"
                  required
                  min={today}
                  value={blockStart}
                  onChange={(e) => {
                    setBlockStart(e.target.value);
                    if (e.target.value >= blockEnd)
                      setBlockEnd(getNextDayString(e.target.value));
                  }}
                  className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:border-red-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-700 block mb-1">
                  Khóa đến ngày
                </label>
                <input
                  type="date"
                  required
                  min={getNextDayString(blockStart)}
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:border-red-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700 block mb-1">
                Số lượng khóa
              </label>
              <input
                type="number"
                min="1"
                required
                value={blockQty}
                onChange={(e) => setBlockQty(Number(e.target.value))}
                className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 block mb-1">
                Lý do khóa
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="VD: Sửa chữa..."
                className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:border-red-500"
              />
            </div>
            <button
              type="submit"
              disabled={isBlocking || !selectedRoomId}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded text-sm font-medium transition disabled:bg-gray-400"
            >
              {isBlocking ? "Đang xử lý..." : "Xác nhận Khóa"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Availability;
