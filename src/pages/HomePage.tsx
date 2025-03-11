import React from "react";
import LessonSection from "../components/home/LessonSection";
import { useLessonScroll } from "../contexts/LessonScrollContext";

const lessonsData = [
  { chapter: "Chương 1", title: "Bài 1A", doneStatus: [true, true, true, false] },
  { chapter: "Chương 1", title: "Bài 1B", doneStatus: [false, false, false, false] },
  { chapter: "Chương 1", title: "Bài 1C", doneStatus: [true, true, false, false] },
  { chapter: "Chương 2", title: "Bài 2A", doneStatus: [false, true, false, false] },
  { chapter: "Chương 2", title: "Bài 2B", doneStatus: [true, true, true, true] },
  { chapter: "Chương 2", title: "Bài 2C", doneStatus: [false, false, false, true] },
];

const HomePage: React.FC = () => {
  const { lessonRefs } = useLessonScroll();

  return (
    <div className="p-6 items-center gap-8">
      {lessonsData.map((lesson) => (
        <div
          key={lesson.title}
          ref={(el) => {
            if (el) lessonRefs.current[lesson.title] = el;
          }}
        >
          <LessonSection chapter={lesson.chapter} title={lesson.title} doneStatus={lesson.doneStatus} />
        </div>
      ))}
    </div>
  );
};

export default HomePage;
