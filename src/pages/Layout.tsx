import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import LessonList from "../components/LessonList";
import Calendar from "../components/Calendar";
import { LessonScrollProvider } from "../contexts/LessonScrollContext";
import { LessonStatusProvider } from "../contexts/LessonStatusContext";
import { useState } from "react";
import background from "../assets/background.png";
import ProgressCircle from "../components/statistics/ProgressCircle";
import { useLessonEntry } from "../contexts/LessonEntryContext";

const getModeFromPath = (
  pathname: string
): "phrase" | "translate" | "listen" | "test" | null => {
  // Example logic: extract mode from pathname, adjust as needed
  if (pathname.includes("phrase")) return "phrase";
  if (pathname.includes("translate")) return "translate";
  if (pathname.includes("listen")) return "listen";
  if (pathname.includes("test")) return "test";
  return null;
};

const Layout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/home";
  const isStatistic = location.pathname === "/statistic";
  const isRanking = location.pathname === "/ranking";
  const [level, setLevel] = useState<string>("N2");
  const [activeChapterId, setActiveChapterId] = useState<number | null>(null);
  const [calendarExpanded, setCalendarExpanded] = useState<boolean>(false);
  const [profileUpdated, setProfileUpdated] = useState(0);

  const { fromLessonSection } = useLessonEntry();
  const state = location.state as { fromLessonSection?: boolean } | null;
  const displayMode = state?.fromLessonSection || fromLessonSection ? getModeFromPath(location.pathname) : null;
  const activeMode = getModeFromPath(location.pathname) // Dung cho phan hien thi lessonStatus trong LessonList theo tung tinh nang

  return (
    <LessonStatusProvider>
      <LessonScrollProvider>
        <div className="flex flex-col h-screen w-full">
          <Header level={level} setLevel={setLevel} isLoggedIn={true} profileUpdated={profileUpdated} setProfileUpdated={setProfileUpdated}/>
          {/* Main layout: Sidebar + Content + LessonList */}
          <div className="grid grid-cols-10 w-full">
            <div className="col-span-2 flex-shrink-0">
              <Sidebar />
            </div>
            <main className="col-span-6 p-6 mt-12 z-10"><Outlet context={{ activeChapterId, level, profileUpdated, setProfileUpdated, }}/></main>
            <div className="col-span-2 mt-20 mr-10 p-4">
              <div className="fixed">
                {isHome && (
                  <div className="mb-6">
                    <Calendar
                      level={level}
                      isExpanded={calendarExpanded}
                      setIsExpanded={setCalendarExpanded}
                    />
                  </div>
                )}
                {!isStatistic && !isRanking ? (
                  <LessonList
                    level={level}
                    onChapterToggle={(id) => setActiveChapterId(id)}
                    displayMode={displayMode}
                    activeMode={activeMode}
                    calendarExpanded={calendarExpanded}
                  />
                ) : 
                  (!isRanking ? (
                    <div className="bg-cyan_pastel rounded-xl border border-cyan_border w-80 text-center mt-12">
                      <div className="text-xl font-bold mt-4 text-cyan_text">Tiến độ</div>
                      <ProgressCircle level={level} />
                    </div>
                  ) : "")
                }
              </div>
            </div>
            {(displayMode || isStatistic) && (
              <div
                className="fixed bottom-[-8vh] right-0 w-[20vw] h-[36vh] bg-repeat-x bg-bottom opacity-100 z-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${background})`,
                  backgroundPosition: "left bottom",
                  backgroundSize: "auto 100%",
                }}
              ></div>
            )}
          </div>
        </div>
      </LessonScrollProvider>
    </LessonStatusProvider>
  );
};

export default Layout;
