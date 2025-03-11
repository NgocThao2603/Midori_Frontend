import React from "react";
import FeatureButton from "./FeatureButton";
import LessonCard from "./LessonCard";
import { Book, Pencil, Headphones, FileText, LucideIcon } from "lucide-react";

type LessonSectionProps = {
  chapter: string;
  title: string;
  doneStatus: boolean[];
};

const defaultIcons: LucideIcon[] = [Book, Pencil, Headphones, FileText];

const LessonSection = React.forwardRef<HTMLDivElement, LessonSectionProps>(
  ({ chapter, title, doneStatus }, ref) => {
    const handleStartLesson = () => alert(`Bắt đầu ${title}!`);

    return (
      <div ref={ref} className="w-full p-6 flex flex-col items-center gap-6">
        {/* Thẻ bài học */}
        <LessonCard chapter={chapter} title={title} onStart={handleStartLesson} />

        {/* Sơ đồ nút chức năng */}
        <div className="relative w-[400px] h-[500px] mx-auto">
          <LessonPath doneStatus={doneStatus} />

          {/* Các FeatureButton */}
          {defaultIcons.map((icon, index) => (
            <FeatureButtonWrapper
              key={index}
              position={buttonPositions[index]}
              icon={icon}
              isDone={doneStatus[index]}
            />
          ))}
        </div>
      </div>
    );
  }
);

export default LessonSection;

/* Vị trí của các FeatureButton */
const buttonPositions = ["top-5 left-0", "top-32 right-0", "top-72 left-0", "top-96 right-0"];

/* Các đoạn nối giữa các FeatureButton */
const paths: [string, number, number][] = [
  ["M60,50 C180,60 260,80 250,130", 0, 1],
  ["M250,130 C240,200 120,180 60,220", 1, 2],
  ["M60,220 C20,280 60,300 250,330", 2, 3],
];

const LessonPath: React.FC<{ doneStatus: boolean[] }> = ({ doneStatus }) => (
  <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg">
    {paths.map(([d, start, end], i) => (
      <path
        key={i}
        d={d}
        stroke={doneStatus[start] && doneStatus[end] ? "#008000" : "#A0A0A0"}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ))}
  </svg>
);

/* FeatureButton được tái sử dụng */
const FeatureButtonWrapper: React.FC<{ position: string; icon: LucideIcon; isDone: boolean }> = ({
  position,
  icon,
  isDone,
}) => (
  <div className={`absolute ${position}`}>
    <FeatureButton icon={icon} isDone={isDone} />
  </div>
);
