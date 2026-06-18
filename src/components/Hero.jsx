import { assets, cities } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Hàm lấy ngày hiện tại (Format: YYYY-MM-DD)
const getTodayString = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Hàm tính ngày hôm sau (Tránh lỗi Timezone của Javascript)
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

const Hero = () => {
  const navigate = useNavigate();

  // (NEW) State quản lý ngày tháng để làm Validate
  const today = getTodayString();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    setCheckIn(newCheckIn);

    // Auto-Validate: Nếu checkOut hiện tại đang nhỏ hơn hoặc bằng checkIn mới -> Tự dời checkOut sang hôm sau
    if (checkOut && newCheckIn >= checkOut) {
      setCheckOut(getNextDayString(newCheckIn));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const city = e.target.destinationInput.value;
    const quantity = e.target.guests.value;

    const query = new URLSearchParams({
      city,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      quantity,
    }).toString();

    navigate(`/rooms?${query}`);
  };

  return (
    <div className="flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white bg-[url(/src/assets/heroImage1.png)] bg-no-repeat bg-cover bg-center h-screen">
      <p className="bg-[#49B9FF]/50 px-3.5 py-1 rounded-full mt-20">
        The Ultimate Hotel Experience
      </p>
      <h1 className="font-playfair text-2xl md:text-5xl md:text-[56px] md:loading-[56px] font-bold md:font-extrabold max-w-xl mt-4">
        Discover Your Perfect Stay
      </h1>
      <p className="max-w-130 mt-2 text-sm md:text-base">
        Unparalleled luxury and comfort await you at every turn.
      </p>

      <form
        onSubmit={handleSearch}
        className="bg-white text-gray-500 rounded-lg px-6 py-4 mt-8 flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto"
      >
        <div>
          <div className="flex items-center gap-2">
            <img src={assets.calenderIcon} alt="calendar" className=" h-4" />
            <label htmlFor="destinationInput">Destination</label>
          </div>
          <input
            list="destinations"
            id="destinationInput"
            name="city"
            type="text"
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none"
            placeholder="Type here"
          />
          <datalist id="destinations">
            {cities.map((city, index) => (
              <option key={index} value={city} />
            ))}
          </datalist>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <img src={assets.calenderIcon} alt="calendar" className=" h-4" />
            <label htmlFor="checkIn">Check in</label>
          </div>
          <input
            id="checkIn"
            type="date"
            required
            min={today} // (NEW) Khóa ngày quá khứ
            value={checkIn}
            onChange={handleCheckInChange}
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <img src={assets.calenderIcon} alt="calendar" className=" h-4" />
            <label htmlFor="checkOut">Check out</label>
          </div>
          <input
            id="checkOut"
            type="date"
            required
            min={checkIn ? getNextDayString(checkIn) : getNextDayString(today)} // (NEW) Ép Check-out phải sau Check-in
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none"
          />
        </div>

        <div className="flex md:flex-col max-md:gap-2 max-md:items-center">
          <label htmlFor="guests">Rooms</label>
          <input
            min={1}
            max={10}
            id="guests"
            type="number"
            required
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none max-w-16"
            placeholder="1"
            defaultValue={1}
          />
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-1 rounded-md bg-black py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-1"
        >
          <img src={assets.searchIcon} alt="searchIcon" className=" h-7" />
          <span>Search</span>
        </button>
      </form>
    </div>
  );
};

export default Hero;
