import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import HotelCard from "../components/HotelCard";
import { searchHotelsApi, getHotelDetailApi } from "../services/publicService";

const CheckBox = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onChange(e.target.checked, label)}
      />
      <span className="font-light select-none">{label}</span>
    </label>
  );
};

const RadioButton = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input
        type="radio"
        name="sortOption"
        checked={selected}
        onChange={() => onChange(label)}
      />
      <span className="font-light select-none">{label}</span>
    </label>
  );
};

const AllRooms = () => {
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const roomTypes = [
    "Single Room",
    "Double Room",
    "Luxury Room",
    "Family Room",
  ];
  const priceRanges = ["0 to 500", "500 to 1000", "1000 to 2000", "2000+"];
  const sortOptions = [
    "Price: Low to High",
    "Price: High to Low",
    "Newest First",
  ];

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const params = {
          city: searchParams.get("city") || "",
          checkInDate: searchParams.get("checkInDate") || "",
          checkOutDate: searchParams.get("checkOutDate") || "",
          quantity: searchParams.get("quantity") || 1,
        };

        // 1. Gọi API Search (BE chỉ trả về ID và rooms)
        const res = await searchHotelsApi(params);
        const searchResults = res.data?.data ?? res.data ?? [];

        // 2. Tự động dùng vòng lặp gọi API Detail để lấy Tên và Hình ảnh
        const detailedHotels = await Promise.all(
          searchResults.map(async (searchItem) => {
            try {
              const detailRes = await getHotelDetailApi(searchItem.id);
              const hotelInfo = detailRes.data?.data ?? detailRes.data;
              console.log("searchItem.rooms:", searchItem.rooms);
              console.log("hotelInfo:", hotelInfo);

              // Tính giá rẻ nhất từ danh sách phòng trả về
              const minPrice =
                searchItem.rooms?.length > 0
                  ? Math.min(
                      ...searchItem.rooms.map(
                        (r) => r.pricePerNight || r.price || 0,
                      ),
                    )
                  : 0;
              console.log("minPrice:", minPrice);
              return {
                ...hotelInfo, // Đắp tên, thành phố, địa chỉ từ Detail
                minPricePerNight: minPrice,
                availableRoomTypes: searchItem.rooms,
              };
            } catch (err) {
              console.error(`Lỗi tải chi tiết hotel ${searchItem.id}`, err);
              return null;
            }
          }),
        );

        // 3. Lọc các khách sạn thành công và render
        setHotels(detailedHotels.filter((h) => h !== null));
      } catch (error) {
        console.error("Lỗi tìm kiếm khách sạn:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchParams]);

  return (
    <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="flex-1 w-full lg:mr-8">
        <div className="flex flex-col items-start text-left mb-8">
          <h1 className="font-playfair text-4xl md:text-[40px]">
            Search Results
          </h1>
          <p className="text-sm md:text-base text-gray-500/90 mt-2">
            Found {hotels.length} hotels matching your criteria.
          </p>
        </div>

        {loading ? (
          <p className="text-gray-500 py-10">Đang tìm kiếm khách sạn...</p>
        ) : hotels.length === 0 ? (
          <p className="text-gray-500 py-10">Không tìm thấy khách sạn nào.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {hotels.map((hotel, index) => (
              <HotelCard key={hotel.id} hotel={hotel} index={index} />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white w-full lg:w-80 lg:shrink-0 border border-gray-300 text-gray-600 max-lg:mb-8 min-lg:mt-16">
        <div
          className={`flex items-center justify-between px-5 py-2.5 lg:border-b border-gray-300 ${openFilter ? "border-b" : ""}`}
        >
          <p className="text-base font-medium text-gray-700">FILTERS</p>
          <div className="text-xs cursor-pointer ">
            <span
              onClick={() => setOpenFilter(!openFilter)}
              className="lg:hidden"
            >
              {openFilter ? "Hide" : "SHOW"}
            </span>
            <span className="hidden lg:block ">CLEAR</span>
          </div>
        </div>
        <div
          className={`${openFilter ? "h-auto" : "h-0 lg:h-auto"} overflow-hidden transition-all duration-700`}
        >
          <div className="px-5 pt-5">
            <p className="font-medium text-gray-800 pb-2 ">Popular Filter</p>
            {roomTypes.map((room, index) => (
              <CheckBox key={index} label={room} />
            ))}
          </div>
          <div className="px-5 pt-5">
            <p className="font-medium text-gray-800 pb-2 ">Price Range</p>
            {priceRanges.map((range, index) => (
              <CheckBox key={index} label={`$${range}`} />
            ))}
          </div>
          <div className="px-5 pt-5 pb-7">
            <p className="font-medium text-gray-800 pb-2 ">Sort By</p>
            {sortOptions.map((option, index) => (
              <RadioButton key={index} label={option} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllRooms;
