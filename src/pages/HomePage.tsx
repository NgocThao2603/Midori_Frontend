import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import LessonSection from "../components/home/LessonSection";
import { useLessonScroll } from "../contexts/LessonScrollContext";
import { useLessonStatuses } from "../contexts/LessonStatusContext";
import { fetchChapters, Chapter } from "../services/api";

const HomePage: React.FC = () => {
  const { lessonRefs } = useLessonScroll();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const { lessonStatuses } = useLessonStatuses();
  const { activeChapterId, level } = useOutletContext<{ activeChapterId: number | null; level: string }>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chapterData = await fetchChapters(level);
        setChapters(chapterData);
      } catch (error) {
        console.error("Lỗi khi load chapters:", error);
      }
    };
    fetchData();
  }, [level]);

  return (
    <div className="px-6 items-center gap-8">
      {chapters
        .filter((chapter) => chapter.id === activeChapterId)
        .flatMap((chapter) =>
          chapter.lessons.map((lesson) => (
            <div
              key={lesson.id}
              ref={(el) => {
                if (el) lessonRefs.current[lesson.id] = el;
              }}
            >
              <LessonSection
                lessonId={lesson.id}
                chapter={chapter.title}
                title={lesson.title}
                doneStatus={lessonStatuses[lesson.id] || [false, false, false, false]}
              />
            </div>
          ))
        )}
    </div>
  );
};

export default HomePage;
