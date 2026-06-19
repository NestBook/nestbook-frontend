import { useState, useEffect } from "react";
import HotelCard from "./HotelCard";
import Title from "./Title";
import { useNavigate } from "react-router-dom";
import { searchHotelsApi, getHotelDetailApi, getHotelRatingApi } from "../services/publicService";

const FeaturedDestination = () => {
  const navigate = useNavigate();
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const res = await searchHotelsApi({});
        const searchResults = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];

        const topIds = searchResults.slice(0, 8);

        const detailedHotels = await Promise.all(
          topIds.map(async (searchItem) => {
            // Lấy ID một cách an toàn, thử cả 'id' và '_id'
            const hotelId = searchItem.id || searchItem._id;

            // Nếu không có ID thì bỏ qua, tránh gọi API lỗi
            if (!hotelId) return null;

            try {
              let hotelInfo = null;
              let ratingData = { avgRating: 0, totalReviews: 0 };

              try {
                const detailRes = await getHotelDetailApi(hotelId);
                hotelInfo = detailRes.data?.data?.data ?? detailRes.data?.data ?? detailRes.data;
              } catch (err) {
                console.error(`Lỗi lấy chi tiết hotel ${hotelId}`, err);
                return null;
              }

              try {
                const ratingRes = await getHotelRatingApi(hotelId);
                ratingData = ratingRes.data?.data ?? ratingRes.data ?? { avgRating: 0, totalReviews: 0 };
              } catch (err) {
                console.warn(`Lỗi lấy rating cho hotel ${hotelId} (chưa đăng nhập):`, err);
              }

              const roomsList = searchItem.availableRoomTypes || searchItem.rooms || [];
              const minPrice =
                searchItem.minPricePerNight ||
                (roomsList.length > 0
                  ? Math.min(
                      ...roomsList.map(
                        (r) => r.pricePerNight || r.price || 0,
                      ),
                    )
                  : 0);

              return {
                ...hotelInfo,
                minPricePerNight: minPrice,
                availableRoomTypes: roomsList,
                averageRating: ratingData.avgRating > 0 ? ratingData.avgRating : 5.0,
                reviewCount: ratingData.totalReviews,
              };
            } catch (error) {
              console.error(`Lỗi lấy chi tiết hotel ${hotelId}`, error);
              return null;
            }
          }),
        );

        setFeaturedHotels(detailedHotels.filter((h) => h !== null));
      } catch (error) {
        console.error("Lỗi lấy khách sạn nổi bật:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  return (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20">
      <Title
        title="Featured Destinations"
        subTitle="Discover our most popular destinations"
      />

      <div className="flex flex-wrap items-center justify-center lg:justify-between gap-6 mt-20 w-full">
        {loading ? (
          <p className="text-gray-500 w-full text-center">
            Đang tải danh sách...
          </p>
        ) : featuredHotels.length === 0 ? (
          <p className="text-gray-500 w-full text-center">
            Chưa có khách sạn nào.
          </p>
        ) : (
          featuredHotels.map((hotel, index) => (
            <HotelCard
              key={hotel?.id || hotel?._id || index}
              hotel={hotel}
              index={index}
            />
          ))
        )}
      </div>

      <button
        onClick={() => {
          navigate("/rooms");
          window.scrollTo(0, 0);
        }}
        className="my-16 px-4 py-2 text-sm font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 transition-all cursor-pointer"
      >
        View All Destinations
      </button>
    </div>
  );
};

export default FeaturedDestination;
