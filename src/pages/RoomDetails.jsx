import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import StarRating from "../components/StarRating";
import {
  getHotelDetailApi,
  getHotelRoomTypesApi,
  getHotelRatingApi,
} from "../services/publicService";
import RoomBookingQuote from "../components/RoomBookingQuote";
import RoomReviews from "../components/RoomReviews";

const getTodayString = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getNextDayString = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
const RoomDetails = () => {
  const { id } = useParams();
  console.log("RoomDetails component mounted with hotel ID:", id);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);

  const [ratingStats, setRatingStats] = useState({ avgRating: 0, totalReviews: 0 });
  useEffect(() => {
    const fetchHotelInfo = async () => {
      try {
        console.log("Fetching hotel info for ID:", id);
        setLoading(true);
        let hotelRes, roomsRes;
        let ratData = { avgRating: 0, totalReviews: 0 };

        try {
          const res = await Promise.all([
            getHotelDetailApi(id),
            getHotelRoomTypesApi(id),
          ]);
          hotelRes = res[0];
          roomsRes = res[1];
        } catch (err) {
          console.error("Lỗi khi tải thông tin chính của khách sạn", err);
          throw err; // Ném lỗi để nhảy vào catch ngoài và hiển thị lỗi
        }

        try {
          const ratingRes = await getHotelRatingApi(id);
          ratData = ratingRes.data?.data ?? ratingRes.data ?? { avgRating: 0, totalReviews: 0 };
        } catch (err) {
          console.warn("Lỗi khi tải rating khách sạn (có thể do chưa đăng nhập):", err);
        }

        console.log("Hotel Detail API response:", { hotelRes, roomsRes });

        // Backend bọc double-nested: { success: true, data: { success: true, data: {...} } }
        const hotelData = hotelRes.data?.data?.data ?? hotelRes.data?.data ?? hotelRes.data;
        const roomsPayload = roomsRes.data?.data ?? roomsRes.data;

        // BÓC TÁCH MẢNG ROOM TYPES
        const roomsArray = Array.isArray(roomsPayload)
          ? roomsPayload
          : roomsPayload?.roomTypes || [];

        // --- GỘP ẢNH HOTEL + ẢNH TỪ TẤT CẢ ROOM TYPES THÀNH 1 GALLERY ---
        const hotelImgs = (hotelData?.images ?? []).map(
          (img) => img?.url || img,
        );
        const roomImgs = roomsArray.flatMap((rt) =>
          (rt.images ?? []).map((img) => img?.url || img),
        );
        const allImages = [...new Set([...hotelImgs, ...roomImgs])]; // Loại bỏ ảnh trùng lặp

        // Lưu thông tin khách sạn kèm theo mảng ảnh tổng hợp
        setHotel({ ...hotelData, _galleryImages: allImages });
        setRoomTypes(roomsArray);
        setRatingStats(ratData);

        if (allImages.length > 0) setMainImage(allImages[0]);
        else setMainImage("https://picsum.photos/800/500");
      } catch (error) {
        console.error("Lỗi khi tải thông tin khách sạn", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHotelInfo();
    }
  }, [id]);

  const handleReviewSubmitted = async () => {
    try {
      const ratingRes = await getHotelRatingApi(id);
      const ratData = ratingRes.data?.data ?? ratingRes.data ?? { avgRating: 0, totalReviews: 0 };
      setRatingStats(ratData);
    } catch (err) {
      console.error("Lỗi khi tải điểm đánh giá:", err);
    }
  };

  if (loading)
    return (
      <div className="py-30 text-center text-gray-500">
        Đang tải thông tin...
      </div>
    );
  if (!hotel)
    return <div className="py-30 text-center">Không tìm thấy khách sạn!</div>;

  // Lấy mảng ảnh tổng hợp đã gộp ở useEffect
  const hotelImages = hotel._galleryImages ?? [];

  return (
    <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
        <h1 className="text-3xl md:text-4xl font-playfair">{hotel.name}</h1>
        <p className="text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full">
          20% OFF
        </p>
      </div>

      <div className="flex items-center gap-1 mt-2">
        <StarRating rating={Math.round(ratingStats.avgRating) || 5} />
        <p className="ml-2">
          {ratingStats.avgRating > 0 ? ratingStats.avgRating.toFixed(1) : "0.0"} ({ratingStats.totalReviews} Reviews)
        </p>
      </div>

      <div className="flex items-center gap-1 text-gray-500 mt-2">
        <img src={assets.locationIcon} alt="location-icon" />
        <span>
          {hotel.address}, {hotel.city}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row mt-6 gap-6">
        <div className="lg:w-1/2 w-full">
          <img
            src={mainImage}
            alt="Main Hotel"
            className="w-full h-[400px] rounded-xl shadow-lg object-cover"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full h-[400px] overflow-y-auto">
          {hotelImages.map((img, index) => (
            <img
              onClick={() => setMainImage(img)}
              key={index}
              src={img} // Vì logic ở trên đã bóc tách img thành URL string
              alt="Hotel thumbnail"
              className={`w-full h-48 rounded-xl shadow-md object-cover cursor-pointer ${
                mainImage === img ? "outline-3 outline-orange-500" : ""
              }`}
            />
          ))}
        </div>
      </div>

      <RoomBookingQuote
        hotelId={id}
        roomTypes={roomTypes}
        searchParams={searchParams}
        navigate={navigate}
      />

      <div className="max-w-3xl border-t border-gray-300 my-15 py-10 text-gray-500 mt-16">
        <h3 className="text-xl text-gray-800 font-medium mb-4">
          Mô tả khách sạn
        </h3>
        <p>{hotel.description || "Chưa có mô tả chi tiết."}</p>
      </div>

      <RoomReviews
        hotelId={id}
        ratingStats={ratingStats}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default RoomDetails;
