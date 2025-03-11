import { useState } from "react";
import { List, ListItemButton, ListItemText, Collapse } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useLessonScroll } from "../contexts/LessonScrollContext";

const lessons = [
  {
    chapter: "Chương 1",
    lessons: [
      { title: "Bài 1A" },
      { title: "Bài 1B" },
      { title: "Bài 1C" },
    ],
  },
  {
    chapter: "Chương 2",
    lessons: [
      { title: "Bài 2A" },
      { title: "Bài 2B" },
      { title: "Bài 2C" },
    ],
  },
];

const LessonList = () => {
  const [openChapters, setOpenChapters] = useState<{ [key: string]: boolean }>({});
  const { scrollToLesson } = useLessonScroll();

  const handleToggleChapter = (chapter: string) => {
    setOpenChapters((prev) => ({ ...prev, [chapter]: !prev[chapter] }));
  };

  return (
    <div className="bg-green_pastel rounded-xl p-4 border w-80">
      <p className="text-lg font-bold text-center text-secondary mb-4">Danh sách bài</p>
      <div className="bg-white rounded-xl max-h-[35vh] overflow-y-auto scrollbar-hide">
        <List sx={{ padding: 0 }}>
          {lessons.map((chapter) => (
            <div key={chapter.chapter}>
              <ListItemButton
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                  color: "#008000",
                  borderRadius: "12px",
                }}
                onClick={() => handleToggleChapter(chapter.chapter)}
              >
                <ListItemText primary={chapter.chapter} />
                {openChapters[chapter.chapter] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={openChapters[chapter.chapter]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {chapter.lessons.map((lesson) => (
                    <ListItemButton
                      key={lesson.title}
                      className="w-full"
                      onClick={() => scrollToLesson(lesson.title)}
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
