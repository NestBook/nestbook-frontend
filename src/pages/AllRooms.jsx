import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
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

  // State lưu dữ liệu gốc từ API
  const [originalHotels, setOriginalHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  // State cho bộ lọc
  const [selectedSort, setSelectedSort] = useState("Newest First");
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);

  const priceRanges = [
    { label: "0 to 500,000", min: 0, max: 500000 },
    { label: "500,000 to 1,000,000", min: 500000, max: 1000000 },
    { label: "1,000,000 to 2,000,000", min: 1000000, max: 2000000 },
    { label: "2,000,000+", min: 2000000, max: 999999999 },
  ];
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

        const res = await searchHotelsApi(params);
        const searchResults = res.data?.data ?? res.data ?? [];

        const detailedHotels = await Promise.all(
          searchResults.map(async (searchItem) => {
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
                availableRoomTypes: searchItem.rooms,
              };
            } catch {
              return null;
            }
          }),
        );

        // Lưu dữ liệu gốc để lát nữa còn filter
        setOriginalHotels(detailedHotels.filter((h) => h !== null));
      } catch (error) {
        console.error("Lỗi tìm kiếm khách sạn:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchParams]);

  // LOGIC XỬ LÝ LỌC & SẮP XẾP BẰNG USEMEMO
  const displayedHotels = useMemo(() => {
    let filtered = [...originalHotels];

    // 1. Lọc theo giá
    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter((hotel) => {
        return selectedPriceRanges.some((rangeLabel) => {
          const rangeObj = priceRanges.find((r) => r.label === rangeLabel);
          return (
            hotel.minPricePerNight >= rangeObj.min &&
            hotel.minPricePerNight <= rangeObj.max
          );
        });
      });
    }

    // 2. Sắp xếp
    if (selectedSort === "Price: Low to High") {
      filtered.sort((a, b) => a.minPricePerNight - b.minPricePerNight);
    } else if (selectedSort === "Price: High to Low") {
      filtered.sort((a, b) => b.minPricePerNight - a.minPricePerNight);
    } else if (selectedSort === "Newest First") {
      // Giả sử ID lớn hơn là tạo sau (nếu dùng UUID thì cần check createdAt)
      filtered.sort((a, b) => Number(b.id) - Number(a.id));
    }

    return filtered;
  }, [originalHotels, selectedPriceRanges, selectedSort]);

  // Xử lý khi tick chọn ô Giá
  const handlePriceChange = (isChecked, label) => {
    if (isChecked) {
      setSelectedPriceRanges((prev) => [...prev, label]);
    } else {
      setSelectedPriceRanges((prev) => prev.filter((item) => item !== label));
    }
  };

  const clearFilters = () => {
    setSelectedPriceRanges([]);
    setSelectedSort("Newest First");
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="flex-1 w-full lg:mr-8">
        <div className="flex flex-col items-start text-left mb-8">
          <h1 className="font-playfair text-4xl md:text-[40px]">
            Search Results
          </h1>
          <p className="text-sm md:text-base text-gray-500/90 mt-2">
            Found {displayedHotels.length} hotels matching your criteria.
          </p>
        </div>

        {loading ? (
          <p className="text-gray-500 py-10">Đang tìm kiếm khách sạn...</p>
        ) : displayedHotels.length === 0 ? (
          <p className="text-gray-500 py-10">
            Không tìm thấy khách sạn nào phù hợp với bộ lọc.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {displayedHotels.map((hotel, index) => (
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
          <div className="text-xs cursor-pointer">
            <span
              onClick={() => setOpenFilter(!openFilter)}
              className="lg:hidden mr-2"
            >
              {openFilter ? "Hide" : "SHOW"}
            </span>
            <span
              onClick={clearFilters}
              className="text-blue-600 hover:underline"
            >
              CLEAR
            </span>
          </div>
        </div>
        <div
          className={`${openFilter ? "h-auto" : "h-0 lg:h-auto"} overflow-hidden transition-all duration-700`}
        >
          <div className="px-5 pt-5">
            <p className="font-medium text-gray-800 pb-2 ">Price Range (VNĐ)</p>
            {priceRanges.map((range, index) => (
              <CheckBox
                key={index}
                label={range.label}
                selected={selectedPriceRanges.includes(range.label)}
                onChange={handlePriceChange}
              />
            ))}
          </div>

          <div className="px-5 pt-5 pb-7">
            <p className="font-medium text-gray-800 pb-2 ">Sort By</p>
            {sortOptions.map((option, index) => (
              <RadioButton
                key={index}
                label={option}
                selected={selectedSort === option}
                onChange={setSelectedSort}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllRooms;
