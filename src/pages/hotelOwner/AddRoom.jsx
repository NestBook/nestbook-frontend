import { useState, useEffect } from "react";
import Title from "../../components/Title";
import {
  createRoomTypeApi,
  getOwnerHotelsApi,
} from "../../services/ownerService";

const AddRoom = () => {
  const [inputs, setInputs] = useState({
    hotelId: "",
    roomType: "",
    pricePerNight: "",
    totalQuantity: "",
    bedType: "King",
    amenities: {
      "Free Wi-Fi": false,
      "Free Breakfast": false,
      "Room Service": false,
      "Mountain View": false,
      "Pool Access": false,
    },
  });

  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await getOwnerHotelsApi();
        const list = res.data?.data ?? res.data ?? [];
        setHotels(list);
        if (list.length > 0) {
          setInputs((prev) => ({ ...prev, hotelId: String(list[0].id) }));
        }
      } catch {
        setErrorMessage("Không thể tải danh sách khách sạn.");
      }
    };
    fetchHotels();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!inputs.hotelId) {
      setErrorMessage("Vui lòng chọn khách sạn!");
      return;
    }
    if (!inputs.roomType || !inputs.pricePerNight || !inputs.totalQuantity) {
      setErrorMessage("Vui lòng điền đầy đủ tên phòng, giá và số lượng!");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        hotelId: String(inputs.hotelId),
        name: inputs.roomType,
        bedType: inputs.bedType,
        price: Number(inputs.pricePerNight),
        amenities: Object.keys(inputs.amenities).filter(
          (k) => inputs.amenities[k],
        ),
        totalQuantity: Number(inputs.totalQuantity),
      };

      await createRoomTypeApi(payload);

      setSuccessMessage("Đã thêm phòng mới thành công!");

      // Reset inputs theo đúng chuẩn mới
      setInputs((prev) => ({
        ...prev,
        roomType: "",
        pricePerNight: "",
        totalQuantity: "",
        bedType: "King",
        amenities: Object.fromEntries(
          Object.keys(prev.amenities).map((k) => [k, false]),
        ),
      }));
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Có lỗi xảy ra trong quá trình thêm phòng!",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Title
        align="left"
        font="outfit"
        title="Add Room"
        subtitle="Provide room details to list a new room."
      />

      {errorMessage && (
        <div className="bg-red-50 text-red-500 p-3 rounded mt-4 text-sm border border-red-100">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 text-green-600 p-3 rounded mt-4 text-sm border border-green-100">
          {successMessage}
        </div>
      )}

      {hotels.length > 1 && (
        <div className="mt-6 max-w-xs">
          <p className="text-gray-800">Khách sạn</p>
          <select
            value={inputs.hotelId}
            onChange={(e) => setInputs({ ...inputs, hotelId: e.target.value })}
            className="border opacity-70 border-gray-300 mt-1 rounded p-2 w-full focus:outline-none focus:border-blue-500"
          >
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="w-full flex max-sm:flex-col sm:gap-4 mt-6">
        <div className="flex-1 max-w-48">
          <p className="text-gray-800 mt-4">Room Type</p>
          <input
            type="text"
            placeholder="e.g. Deluxe Room"
            value={inputs.roomType}
            onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })}
            className="border border-gray-300 mt-1 rounded p-2 w-full focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex-1 max-w-48">
          <p className="text-gray-800 mt-4">Bed Type</p>
          <select
            onChange={(e) => setInputs({ ...inputs, bedType: e.target.value })}
            value={inputs.bedType}
            className="border opacity-70 border-gray-300 mt-1 rounded p-2 w-full focus:outline-none focus:border-blue-500"
          >
            {["Single", "Double", "Queen", "King", "Twin"].map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mt-4 text-gray-800">
            Price<span className="text-xs">/night (VNĐ)</span>
          </p>
          <input
            onChange={(e) =>
              setInputs({ ...inputs, pricePerNight: e.target.value })
            }
            value={inputs.pricePerNight}
            className="border border-gray-300 mt-1 rounded p-2 w-32 focus:outline-none focus:border-blue-500"
            type="number"
            min="0"
            placeholder="e.g. 1200000"
          />
        </div>

        <div>
          <p className="mt-4 text-gray-800">
            Quantity<span className="text-xs"> (Rooms)</span>
          </p>
          <input
            onChange={(e) =>
              setInputs({ ...inputs, totalQuantity: e.target.value })
            }
            value={inputs.totalQuantity}
            className="border border-gray-300 mt-1 rounded p-2 w-28 focus:outline-none focus:border-blue-500"
            type="number"
            min="1"
            placeholder="e.g. 5"
          />
        </div>
      </div>

      <div>
        <p className="text-gray-800 mt-6">Amenities</p>
        <div className="flex flex-col flex-wrap mt-2 text-gray-600 max-w-sm gap-2">
          {Object.keys(inputs.amenities).map((amenity, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 border px-3 py-2 rounded cursor-pointer transition-colors ${
                inputs.amenities[amenity]
                  ? "bg-blue-50 border-blue-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                id={`amenities${index + 1}`}
                checked={inputs.amenities[amenity]}
                onChange={() =>
                  setInputs({
                    ...inputs,
                    amenities: {
                      ...inputs.amenities,
                      [amenity]: !inputs.amenities[amenity],
                    },
                  })
                }
                className="cursor-pointer"
              />
              <label
                htmlFor={`amenities${index + 1}`}
                className="cursor-pointer flex-1"
              >
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`px-8 py-3 rounded mt-8 text-white transition-all ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-md"
        }`}
      >
        {isLoading ? "ĐANG XỬ LÝ..." : "ADD ROOM"}
      </button>
    </form>
  );
};

export default AddRoom;
