const Title = ({
  title,
  subTitle,
  align = "center",
  font = "font-playfair",
  tag = "h1",
}) => {
  // Cho phép chọn thẻ (h1, h2, h3) để chuẩn SEO
  const Tag = tag;

  return (
    <div
      className={`flex flex-col justify-center ${
        align === "left"
          ? "items-center md:items-start text-center md:text-left"
          : "items-center text-center"
      }`}
    >
      <Tag className={`text-4xl md:text-[40px] ${font}`}>{title}</Tag>

      {subTitle && (
        <p className="text-sm md:text-base text-gray-500/90 mt-2 max-w-174">
          {subTitle}
        </p>
      )}
    </div>
  );
};

export default Title;
