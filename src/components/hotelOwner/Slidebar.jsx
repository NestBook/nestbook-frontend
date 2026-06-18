import { NavLink } from "react-router-dom";
import { assets } from "../../assets/assets";

const Slidebar = () => {
  const sidebarLink = [
    { name: "Dashboard", path: "/owner", icon: assets.dashboardIcon }, // Thêm dấu phẩy
    { name: "Add Room", path: "/owner/add-room", icon: assets.addIcon }, // Thêm dấu phẩy và sửa "add-romm"
    { name: "List Room", path: "/owner/list-room", icon: assets.listIcon },
  ];

  return (
    <div className="md:w-64 w-16 border-r h-full text-base border-gray-300 pt-4 flex flex-col transition-all duration-300">
      {sidebarLink.map((item, index) => (
        <NavLink
          to={item.path}
          key={index}
          end
          className={({ isActive }) =>
            `flex items-center py-3 px-4 md:px-8 gap-3 transition-all ${
              isActive
                ? "border-r-4 md:border-r-[6px] bg-blue-600/10 border-blue-600 text-blue-600"
                : "hover:bg-gray-100/90 border-r-4 border-transparent text-gray-700"
            }`
          }
        >
          <img src={item.icon} alt={item.name} className="w-6 h-6" />
          <p className="md:block hidden whitespace-nowrap">{item.name}</p>
        </NavLink>
      ))}
    </div>
  );
};

export default Slidebar;
