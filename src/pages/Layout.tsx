import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import LessonList from "../components/LessonList";
import Calendar from "../components/Calendar";
import { LessonScrollProvider } from "../contexts/LessonScrollContext";
import { useState } from "react";

const Layout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/home";
  const [level, setLevel] = useState<string>("N3");

  return (
    <LessonScrollProvider>
      <div className="flex flex-col h-screen w-full">
        <Header level={level} setLevel={setLevel} isLoggedIn={true}/>
        {/* Main layout: Sidebar + Content + LessonList */}
        <div className="grid grid-cols-10 w-full">
          <div className="col-span-2 flex-shrink-0">
            <Sidebar />
          </div>
          <main className="col-span-6 p-6 mt-12 z-10"><Outlet /></main>
          <div className="col-span-2 mt-20 mr-10 p-4">
            <div className="fixed">
              {isHome && (
                <div className="mb-6">
                  <Calendar />
                </div>
              )}
              <LessonList level={level}/>
            </div>
          </div>
        </div>
      </div>
    </LessonScrollProvider>
  );
};

export default Layout;
