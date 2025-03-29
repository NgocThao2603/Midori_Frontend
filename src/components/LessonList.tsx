import { useEffect, useState } from "react";
import { List, ListItemButton, ListItemText, Collapse } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useLessonScroll } from "../contexts/LessonScrollContext";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

interface Lesson {
  id: number;
  title: string;
}

interface Chapter {
  id: number;
  title: string;
  level: string;
  lessons: Lesson[];
}

const LessonList = ({ level }: { level: string }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/home";
  const [openChapters, setOpenChapters] = useState<{ [key: number]: boolean }>({});
  const { scrollToLesson } = useLessonScroll();
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const handleToggleChapter = (chapter: number) => {
    setOpenChapters((prev) => ({ ...prev, [chapter]: !prev[chapter] }));
  };

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const { data } = await axios.get<Chapter[]>(`http://localhost:3000/api/chapters`, {
          params: { level }
        });
        setChapters(data);
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
      }
    };

    fetchChapters();
  }, [level]);

  const handleLessonClick = (lessonId: number) => {
    if (location.pathname === "/home") {
      scrollToLesson(lessonId);
    } else {
      let targetPath = `/learn-phrase/${lessonId}`; // Mặc định là trang Learn Phrase
  
      if (location.pathname.startsWith("/learn-kanji")) {
        targetPath = `/learn-kanji/${lessonId}`;
      } else if (location.pathname.startsWith("/learn-grammar")) {
        targetPath = `/learn-grammar/${lessonId}`;
      }
  
      navigate(targetPath);
    }
  };  

  return (
    <div className="bg-green_pastel rounded-xl p-4 border w-80">
      <p className="text-lg font-bold text-center text-secondary mb-4">Danh sách bài</p>
      <div className={`bg-white rounded-xl overflow-y-auto scrollbar-hide ${isHome ? "max-h-[35vh]" : "max-h-[75vh]"}`}>
        <List sx={{ padding: 0 }}>
          {chapters.map((chapter) => (
            <div key={chapter.id}>
              <ListItemButton
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                  color: "#008000",
                  borderRadius: "12px",
                }}
                onClick={() => handleToggleChapter(chapter.id)}
              >
                <ListItemText primary={chapter.title} />
                {openChapters[chapter.id] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={openChapters[chapter.id]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {chapter.lessons.map((lesson) => (
                    <ListItemButton
                      key={lesson.title}
                      className="w-full"
                      onClick={() => handleLessonClick(lesson.id)}
                      sx={{
                        paddingLeft: "28px",
                        borderRadius: "12px",
                        color: "#4b5563",
                        fontWeight: "normal",
                      }}
                    >
                      <ListItemText primary={lesson.title} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </div>
          ))}
        </List>
      </div>
    </div>
  );
};

export default LessonList;
