import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import HotelCard from "../components/HotelCard";
import { searchHotelsApi, getHotelDetailApi } from "../services/publicService";

const SearchHotels = () => {
  const [searchParams] = useSearchParams();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);

      try {
        const params = {
          city: searchParams.get("city") || "",
          checkInDate: searchParams.get("checkInDate") || "",
          checkOutDate: searchParams.get("checkOutDate") || "",
          quantity: Number(searchParams.get("quantity") || 1),
        };

        const res = await searchHotelsApi(params);

        const searchResults = res.data?.data ?? res.data ?? [];

        const detailedHotels = await Promise.all(
          searchResults.map(async (item) => {
            try {
              const detailRes = await getHotelDetailApi(item.id);

              const hotel = detailRes.data?.data ?? detailRes.data;

              const minPrice =
                item.rooms?.length > 0
                  ? Math.min(
                      ...item.rooms.map(
                        (room) => room.pricePerNight || room.price || 0,
                      ),
                    )
                  : 0;

              return {
                ...hotel,
                minPricePerNight: minPrice,
                availableRoomTypes: item.rooms,
              };
            } catch {
              return null;
            }
          }),
        );

        setHotels(detailedHotels.filter(Boolean));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchParams]);

  return (
    <div className="pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32">
      {" "}
      <h1 className="font-playfair text-4xl">Search Results </h1>
      <p className="text-gray-500 mt-2">Found {hotels.length} hotels</p>
      {loading ? (
        <p className="mt-8">Searching...</p>
      ) : hotels.length === 0 ? (
        <p className="mt-8">No hotel found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
          {hotels.map((hotel, index) => (
            <HotelCard key={hotel.id} hotel={hotel} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchHotels;
