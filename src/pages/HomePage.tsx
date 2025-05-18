import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import LessonSection from "../components/home/LessonSection";
import { useLessonScroll } from "../contexts/LessonScrollContext";
import { getLessonStatuses, fetchChapters, Chapter } from "../services/api";

const HomePage: React.FC = () => {
  const { lessonRefs } = useLessonScroll();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessonStatuses, setLessonStatuses] = useState<Record<number, boolean[]>>({});
  const { activeChapterId } = useOutletContext<{ activeChapterId: number | null; level: string }>();

  useEffect(() => {
    // Gọi cả hai API song song
    const fetchData = async () => {
      try {
        const [chapterData, statusData] = await Promise.all([
          fetchChapters("N2"),
          getLessonStatuses(),
        ]);
    
        const statusMap: Record<number, boolean[]> = {};
        Object.entries(statusData).forEach(([lessonId, item]) => {
          statusMap[Number(lessonId)] = [
            item.phrase,
            item.translate,
            item.listen,
            item.test,
          ];
        });
    
        setChapters(chapterData);
        setLessonStatuses(statusMap);
      } catch (error) {
        console.error("Lỗi khi load dữ liệu:", error);
      }
    };    

    fetchData();
  }, []);

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
