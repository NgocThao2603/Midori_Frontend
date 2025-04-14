import { useEffect, useState } from "react";
import { List, ListItemButton, ListItemText, Collapse } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useLessonScroll } from "../contexts/LessonScrollContext";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchChapters } from "../services/api"; 

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

const LessonList = ({ level, onChapterToggle }: { level: string; onChapterToggle: (chapterId: number) => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/home";
  const [openChapters, setOpenChapters] = useState<{ [key: number]: boolean }>({});
  const { scrollToLesson } = useLessonScroll();
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const handleToggleChapter = (chapterId: number) => {
    setOpenChapters((prev) => {
      const isCurrentlyOpen = !!prev[chapterId];

      if (isCurrentlyOpen) {
        return { [chapterId]: false };
      }

      onChapterToggle(chapterId);
      return { [chapterId]: true };
    });
  };  

  useEffect(() => {
    Object.keys(openChapters).forEach((chapterId) => {
      const chapter = chapters.find(ch => ch.id === parseInt(chapterId));
      if (chapter && openChapters[parseInt(chapterId)]) {
        const firstLesson = chapter.lessons[0];
        if (firstLesson) {
          scrollToLesson(firstLesson.id);
        }
      }
    });
  }, [openChapters, chapters, scrollToLesson]);

  useEffect(() => {
    const getChapters = async () => {
      try {
        const data = await fetchChapters(level);
        setChapters(data);

        if (data.length > 0) {
          onChapterToggle(data[0].id);
        }
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
      }
    };

    getChapters();
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
