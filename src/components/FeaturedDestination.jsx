import { useState, useEffect } from "react";
import HotelCard from "./HotelCard";
import Title from "./Title";
import { useNavigate } from "react-router-dom";
import { searchHotelsApi, getHotelDetailApi } from "../services/publicService";

const FeaturedDestination = () => {
  const navigate = useNavigate();
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        // Thay vì gọi getHotelsApi, ta gọi hàm Search rỗng để lấy toàn bộ ID
        const res = await searchHotelsApi({});
        const searchResults = res.data?.data ?? res.data ?? [];

        // Cắt lấy 3 khách sạn đầu tiên
        const topIds = searchResults.slice(0, 8);

        // Tự động gọi API Detail đắp dữ liệu
        const detailedHotels = await Promise.all(
          topIds.map(async (searchItem) => {
            try {
              const detailRes = await getHotelDetailApi(searchItem.id);
              const hotelInfo = detailRes.data?.data ?? detailRes.data;

              const minPrice =
                searchItem.rooms?.length > 0
                  ? Math.min(
                      ...searchItem.rooms.map(
                        (r) => r.pricePerNight || r.price || 0,
                      ),
                    )
                  : 0;

              return {
                ...hotelInfo,
                minPricePerNight: minPrice,
              };
            } catch (error) {
              console.error(`Lỗi lấy chi tiết hotel ${searchItem.id}`, error);
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
            <HotelCard key={hotel.id} hotel={hotel} index={index} />
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
