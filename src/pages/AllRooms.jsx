import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import HotelCard from "../components/HotelCard";
import { getHotelDetailApi, searchHotelsApi, getHotelRatingApi } from "../services/publicService";

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

  // --- PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

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
        console.log({ params });
        const res = await searchHotelsApi(params);
        // Backend bọc double-nested: { success: true, data: { success: true, data: [...] } }
        const searchResults = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
        console.log("=== DỮ LIỆU TỪ API SEARCH ===", searchResults);
        const detailedHotels = await Promise.all(
          searchResults.map(async (searchItem) => {
            // Lấy ID một cách an toàn
            const hotelId = searchItem.id || searchItem._id;
            console.log({ hotelId });
            console.log("Chi tiết từng searchItem:", searchItem);
            // Bỏ qua nếu không có ID
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

        setOriginalHotels(detailedHotels.filter((h) => h !== null));
        setCurrentPage(1); // Reset trang khi có kết quả mới
      } catch (error) {
        console.error("Lỗi tìm kiếm khách sạn:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchParams]);

  // Reset trang khi lọc hoặc sort

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
      filtered.sort((a, b) => Number(b.id) - Number(a.id));
    }

    return filtered;
  }, [originalHotels, selectedPriceRanges, selectedSort]);

  // --- LOGIC CẮT TRANG ---
  const totalPages = Math.ceil(displayedHotels.length / ITEMS_PER_PAGE);
  const currentHotels = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayedHotels.slice(start, start + ITEMS_PER_PAGE);
  }, [displayedHotels, currentPage]);

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
            Không tìm thấy khách sạn nào phù hợp.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {currentHotels.map((hotel, index) => (
                <HotelCard
                  key={hotel?.id || index}
                  hotel={hotel}
                  index={index}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 mb-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 border rounded ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Sidebar */}
      <div className="bg-white w-full lg:w-80 lg:shrink-0 border border-gray-300 text-gray-600 max-lg:mb-8 min-lg:mt-16">
        <div
          className={`flex items-center justify-between px-5 py-2.5 lg:border-b border-gray-300 ${
            openFilter ? "border-b" : ""
          }`}
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
          className={`${
            openFilter ? "h-auto" : "h-0 lg:h-auto"
          } overflow-hidden transition-all duration-700`}
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
