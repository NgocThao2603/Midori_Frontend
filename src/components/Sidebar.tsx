import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import mascot1 from "../assets/mascot1.png";
import home from "../assets/home.png";
import flashcard_logo from "../assets/flashcard_logo.png";
import pencil from "../assets/pencil.webp";
import headphones from "../assets/headphones.png";
import test from "../assets/test.png";
import leaderboard from "../assets/leaderboard.png";
import result from "../assets/result.png";

const Sidebar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("");

  // Tách lessonId từ URL nếu có
  const matchLessonId = location.pathname.match(/\/(learn-phrase|translate|listen)\/(\d+)/);
  const lessonId = matchLessonId ? matchLessonId[2] : "1";

  const menuItems = [
    { name: "Bài học", path: "/home", icon: home },
    { name: "Học cụm từ", path: `/learn-phrase/${lessonId}`, icon: flashcard_logo },
    { name: "Luyện dịch", path: `/translate/${lessonId}`, icon: pencil },
    { name: "Luyện nghe", path: `/listen/${lessonId}`, icon: headphones },
    { name: "Làm bài test", path: "/test", icon: test },
    { name: "Xếp hạng", path: "/ranking", icon: leaderboard },
    { name: "Kết quả", path: "/result", icon: result },
  ];

  useEffect(() => {
    const matched = menuItems.find((item) =>
      location.pathname.startsWith(item.path.split("/")[1] === "" ? "/" : `/${item.path.split("/")[1]}`)
    );
    if (matched) setActiveItem(matched.path);
  }, [location.pathname]);

  return (
    <aside className="fixed w-64 top-0 h-screen bg-white p-6 border-r z-100">
      <h1 className="text-secondary ml-2 font-bold text-4xl mb-6">Midori</h1>
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <Link key={item.name} to={item.path}>
            <Button img={item.icon} text={item.name} active={location.pathname.startsWith(item.path)} />
          </Link>
        ))}
      </nav>
      <img src={mascot1} alt="" className="fixed left-10 bottom-6 w-48 h-48" />
    </aside>
  );
};

export default Sidebar;
