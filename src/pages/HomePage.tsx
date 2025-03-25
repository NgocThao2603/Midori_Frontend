import React from "react";
import LessonSection from "../components/home/LessonSection";
import { useLessonScroll } from "../contexts/LessonScrollContext";

const lessonsData = [
  {id:1, chapter: "Chương 1", title: "Bài 1A", doneStatus: [true, true, true, false] },
  {id:2, chapter: "Chương 1", title: "Bài 1B", doneStatus: [false, false, false, false] },
  {id:3, chapter: "Chương 1", title: "Bài 1C", doneStatus: [true, true, false, false] },
  {id:4, chapter: "Chương 2", title: "Bài 2A", doneStatus: [false, true, false, false] },
  {id:5, chapter: "Chương 2", title: "Bài 2B", doneStatus: [true, true, true, true] },
  {id:6, chapter: "Chương 2", title: "Bài 2C", doneStatus: [false, false, false, true] },
];

const HomePage: React.FC = () => {
  const { lessonRefs } = useLessonScroll();

  return (
    <div className="px-6 items-center gap-8">
      {lessonsData.map((lesson) => (
        <div
          key={lesson.title}
          ref={(el) => {
            if (el) lessonRefs.current[lesson.id] = el;
          }}
        >
          <LessonSection chapter={lesson.chapter} title={lesson.title} doneStatus={lesson.doneStatus} />
        </div>
      ))}
    </div>
  );
};

export default HomePage;
