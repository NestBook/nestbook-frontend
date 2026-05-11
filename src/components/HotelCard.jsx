const HotelCard = ({ room, index }) => {
  return (
    <Link
      to={"/rooms/" + room.id}
      onClick={() => window.scrollTo(0, 0)}
      key={room.id}
    >
      <img src={room.image[0]} alt={""} />
      <p>Best Seller</p>
      <div>
        <div className="flex items-center justify-between">
          <p className="font-playfair text-xl font-medium text-gray-800"></p>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
