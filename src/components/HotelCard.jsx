import { Link, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";

const HotelCard = ({ hotel, room, index }) => {

  const location = useLocation();
  const data = hotel || room;
  if (!data) return null;

  const id = data.id || data._id;
  const name = data.name || data.hotel?.name || "Khách sạn chưa cập nhật tên";
  const address = data.address || data.hotel?.address;
  const city = data.city || data.hotel?.city;
  const rating = data.averageRating || 5.0;


  const isBestSeller = data.reviewCount > 0
    ? (rating >= 4.5)
    : (index % 2 === 0);

  // --- LOGIC TÍNH GIÁ ---
  const directPrice = data.minPricePerNight || data.price || data.lowestPrice;

  const roomPrices = (data.availableRoomTypes || [])
    .map((rt) => rt.price)
    .filter((p) => p > 0);

  const minRoomPrice = roomPrices.length > 0 ? Math.min(...roomPrices) : 0;

  const price = directPrice || minRoomPrice;

  const displayPrice = price > 0 ? price.toLocaleString("vi-VN") : "";

  const showUnit = price > 0;

  // Xử lý ảnh
  let imageSrc = "https://picsum.photos/800/500";

  const hotelImages = data.images ?? [];
  const roomImages =
    data.availableRoomTypes?.flatMap((rt) => rt.images ?? []) ?? [];

  const allImages = [...hotelImages, ...roomImages];

  if (allImages.length > 0) {
    imageSrc = allImages[0]?.url || allImages[0];
  }

  return (
    <Link
      to={`/rooms/${id}${location.search}`}
      onClick={() => window.scrollTo(0, 0)}
      className="relative max-w-70 w-full rounded-xl overflow-hidden bg-white text-gray-500/90 shadow-[0px_4px_4px_rgba(0,0,0,0.05)] transition hover:shadow-lg block"
    >
      <img src={imageSrc} alt="hotel" className="w-full h-48 object-cover" />

      {isBestSeller && (
        <p className="px-3 py-1 absolute top-3 left-3 text-xs bg-white text-gray-800 font-medium rounded-full shadow-sm">
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
            {price > 0 && (
              <span className="text-xs text-gray-500 block">Từ</span>
            )}

            <span className="text-xl text-gray-800 font-semibold">
              {displayPrice}
              {price > 0 && " đ"}
            </span>

            {showUnit && <span className="text-sm">/đêm</span>}
          </p>

          <span className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-all">
            View
          </span>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
