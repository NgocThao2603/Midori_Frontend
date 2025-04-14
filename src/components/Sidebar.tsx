import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "./Button";

const Sidebar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  const menuItems = [
    { name: "Bài học", path: "/home" },
    { name: "Học cụm từ", path: "/learn-phrase/1" },
    { name: "Luyện dịch", path: "/translate" },
    { name: "Luyện nghe", path: "/listen" },
    { name: "Xếp hạng", path: "/ranking" },
    { name: "Kết quả", path: "/result" },
    { name: "Học nhóm", path: "/group" },
  ];

  return (
    <aside className="fixed w-64 top-0 h-screen bg-white p-6 border-r z-100">
      <h1 className="text-secondary ml-2 font-bold text-4xl mb-6">Midori</h1>
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path} onClick={() => setActiveItem(item.path)}>
            <Button text={item.name} active={activeItem === item.path} />
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
