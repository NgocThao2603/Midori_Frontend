import { useEffect, useState } from "react";
import { List, ListItemButton, ListItemText, Collapse, ListItem } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useLessonScroll } from "../contexts/LessonScrollContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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

const LessonList = ({
  level,
  onChapterToggle,
  displayMode,
}: {
  level: string;
  onChapterToggle: (chapterId: number) => void;
  displayMode?: "phrase" | "translate" | "listen" | "test" | null;
}) => {
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

  const [isCompactMode, setIsCompactMode] = useState(false);
  const { lessonId } = useParams();
  const numericLessonId = parseInt(lessonId || "", 10);

  useEffect(() => {
    setIsCompactMode(!!displayMode && !!lessonId);
  }, [displayMode, lessonId]);

  useEffect(() => {
    const getChapters = async () => {
      try {
        const data = await fetchChapters(level);
        setChapters(data);

        if (!isCompactMode && data.length > 0) {
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
      let targetPath = `/learn-phrase/${lessonId}`;
      if (location.pathname.startsWith("/translate")) {
        targetPath = `/translate/${lessonId}`;
      } else if (location.pathname.startsWith("/listen")) {
        targetPath = `/listen/${lessonId}`;
      }
  
      navigate(targetPath);
    }
  };

  const currentMode = location.pathname.split("/")[1];
  const modes = [
    { key: "learn-phrase", label: "Học cụm từ", color: "bg-green-500 hover:bg-green-600" },
    { key: "practice-translate", label: "Luyện dịch", color: "bg-blue-500 hover:bg-blue-600" },
    { key: "practice-listen", label: "Luyện nghe", color: "bg-purple-500 hover:bg-purple-600" },
    { key: "test", label: "Làm bài test", color: "bg-red-500 hover:bg-red-600" },
  ];

  if (isCompactMode) {
    const currentChapter = chapters.find(ch =>
      ch.lessons.some(l => l.id === numericLessonId)
    );
    const currentLesson = currentChapter?.lessons.find(l => l.id === numericLessonId);
    if (!currentChapter || !currentLesson) return null;

    return (
      <div className="bg-green_pastel rounded-xl p-4 border w-80">
        <p className="text-lg font-bold text-center text-secondary mb-4">Bài học hiện tại</p>
        <div className="bg-white rounded-xl max-h-[75vh] overflow-y-auto scrollbar-hide">
          <List sx={{ padding: 0 }}>
            <div key={currentChapter.id}>
              <ListItem
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#008000",
                  borderRadius: "12px",
                  cursor: "default",
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                }}
              >
                <ListItemText
                  primary={`${currentChapter.title} - ${currentLesson.title}`}
                  slotProps={{
                    primary: {
                      sx: {
                        color: "#008000",
                      },
                    },
                  }}
                />
              </ListItem>
              <Collapse in={true} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {modes.map((mode) => (
                    <ListItemButton
                      key={mode.key}
                      onClick={() => {
                        if (currentMode !== mode.key) {
                          navigate(`/${mode.key}/${currentLesson.id}`);
                        }
                      }}
                      sx={{
                        paddingLeft: "28px",
                        borderRadius: "12px",
                        color: "#4b5563",
                        backgroundColor: currentMode === mode.key ? "#F2FDFD" : "transparent",
                        "&:hover": {
                          backgroundColor: currentMode === mode.key ? "#F2FDFD" : "#F2FDFD",
                        },
                      }}
                    >
                      <ListItemText
                        primary={mode.label}
                        slotProps={{
                          primary: {
                            sx: {
                              fontWeight: currentMode === mode.key ? "bold" : "normal",
                              color: currentMode === mode.key ? "#0F8480" : "#4b5563",
                            },
                          },
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </div>
          </List>
        </div>
      </div>
    );
  }

  // Hiển thị mặc định (full)
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
                      key={lesson.id}
                      className="w-full"
                      onClick={() => handleLessonClick(lesson.id)}
                      sx={{
                        paddingLeft: "28px",
                        borderRadius: "12px",
                        color: "#4b5563",
                        backgroundColor: lesson.id === numericLessonId ? "#F2FDFD" : "transparent",
                        "&:hover": {
                          backgroundColor: lesson.id === numericLessonId ? "#F2FDFD" : "#F2FDFD",
                        },
                      }}
                    >
                      <ListItemText 
                        primary={lesson.title}
                        slotProps={{
                          primary: {
                            sx: {
                              fontWeight: lesson.id === numericLessonId ? "bold" : "normal",
                              color: lesson.id === numericLessonId ? "#0F8480" : "#4b5563",
                            },
                          },
                        }}
                      />
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
