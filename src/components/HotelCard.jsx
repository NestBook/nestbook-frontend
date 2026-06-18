import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const HotelCard = ({ hotel, room, index }) => {
  const data = hotel || room;
  if (!data) return null;

  const id = data.id || data._id;
  const name = data.name || data.hotel?.name || "Khách sạn chưa cập nhật tên";
  const address = data.address || data.hotel?.address;
  const city = data.city || data.hotel?.city;

  // Đọc đúng trường price, dự phòng minPricePerNight
  const price = data.minPricePerNight || data.price || data.lowestPrice || 0;

  // Fallback an toàn cho Backend MVP (chưa có trường rating)
  const rating = data.averageRating || 5.0;

  // Xử lý mảng hình ảnh an toàn
  const hotelImages = data.images ?? [];
  const imageSrc =
    hotelImages[0]?.url || hotelImages[0] || "https://picsum.photos/800/500";

  return (
    <Link
      to={"/rooms/" + id}
      onClick={() => window.scrollTo(0, 0)}
      className="relative max-w-70 w-full rounded-xl overflow-hidden bg-white text-gray-500/90 shadow-[0px_4px_4px_rgba(0,0,0,0.05)] transition hover:shadow-lg"
    >
      <img src={imageSrc} alt="hotel" className="w-full h-48 object-cover" />

      {index % 2 === 0 && (
        <p className="px-3 py-1 absolute top-3 left-3 text-xs bg-white text-gray-800 font-medium rounded-full">
          Best Seller
        </p>
      )}

      <div className="p-4 pt-5">
        <div className="flex items-center justify-between">
          <p className="font-playfair text-xl font-medium text-gray-800 line-clamp-1">
            {name}
          </p>
          <div className="flex items-center gap-1 text-sm font-medium">
            <img
              src={assets.starIconFilled}
              alt="star-icon"
              className="w-4 h-4"
            />
            {rating}
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm mt-1">
          <img
            src={assets.locationIcon}
            alt="location-icon"
            className="w-4 h-4"
          />
          <span className="line-clamp-1">
            {address}
            {city ? `, ${city}` : ""}
          </span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p>
            <span className="text-xs text-gray-500 block">Từ</span>
            <span className="text-xl text-gray-800 font-semibold">
              {price.toLocaleString("vi-VN")} đ
            </span>
            <span className="text-sm">/đêm</span>
          </p>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-all cursor-pointer">
            View
          </button>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
