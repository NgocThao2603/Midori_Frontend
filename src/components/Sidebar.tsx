import { useState } from "react";
import Button from "./Button";

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("Bài học");

  const menuItems = [
    "Bài học",
    "Học cụm từ",
    "Luyện dịch",
    "Luyện nghe",
    "Xếp hạng",
    "Kết quả",
    "Học nhóm",
  ];

  return (
    <aside className="fixed w-64 top-0 h-screen bg-white p-6 border-r z-100">
      <h1 className="text-secondary ml-2 font-bold text-4xl mb-6">Midori</h1>
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <Button
            key={item}
            text={item}
            active={activeItem === item}
            onClick={() => setActiveItem(item)}
          />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
