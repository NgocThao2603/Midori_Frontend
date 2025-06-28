import React from "react";
import FeatureButton from "./FeatureButton";
import LessonCard from "./LessonCard";
import { Book, Pencil, Headphones, FileText, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLessonEntry } from "../../contexts/LessonEntryContext";

type LessonSectionProps = {
  lessonId?: number;
  chapter: string;
  title: string;
  doneStatus: boolean[];
};

const defaultFeatures = [
  { key: "book", icon: Book },
  { key: "pencil", icon: Pencil },
  { key: "headphones", icon: Headphones },
  { key: "filetext", icon: FileText },
];

const LessonSection = React.forwardRef<HTMLDivElement, LessonSectionProps>(
  ({ lessonId, chapter, title, doneStatus }, ref) => {
    const { setFromLessonSection } = useLessonEntry();
    const navigate = useNavigate();
        const handleStartLesson = () => {
      if (!lessonId) return;

      // Find first incomplete feature (false status)
      const firstIncompletePath = defaultFeatures.findIndex(
        (_, index) => !doneStatus[index]
      );

      // If all features are complete, navigate to first feature
      if (firstIncompletePath === -1) {
        setFromLessonSection(true);
        navigate(`/learn-phrase/${lessonId}`, {
          state: { fromLessonSection: true }
        });
        return;
      }

      // Map feature index to navigation path
      let path = "";
      switch (firstIncompletePath) {
        case 0:
          path = `/learn-phrase/${lessonId}`;
          break;
        case 1:
          path = `/translate/${lessonId}`;
          break;
        case 2:
          path = `/listen/${lessonId}`;
          break;
        case 3:
          path = `/test/${lessonId}`;
          break;
        default:
          path = `/learn-phrase/${lessonId}`;
      }
      setFromLessonSection(true);
      navigate(path, {
        state: { fromLessonSection: true }
      });
    };

    return (
      <div ref={ref} className="w-full p-6 flex flex-col items-center gap-6">
        {/* Thẻ bài học */}
        <LessonCard 
          chapter={chapter} 
          title={title} 
          onStart={handleStartLesson}
          doneStatus={doneStatus} 
        />

        {/* Sơ đồ nút chức năng */}
        <div className="relative w-[400px] h-[500px] mx-auto">
          <LessonPath doneStatus={doneStatus} />

          {/* Các FeatureButton */}
          {defaultFeatures.map((feature, index) => (
            <FeatureButtonWrapper
              key={index}
              position={buttonPositions[index]}
              icon={feature.icon}
              featureKey={feature.key}
              isDone={doneStatus[index]}
              lessonId={lessonId}
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

const FeatureButtonWrapper: React.FC<{ position: string; icon: LucideIcon; featureKey: string; isDone: boolean; lessonId?: number }> = ({
  position,
  icon,
  featureKey,
  isDone,
  lessonId,
}) => {
  const navigate = useNavigate();
  const { setFromLessonSection } = useLessonEntry();

  const handleClick = () => {
    let path = `/learn-phrase/${lessonId}`;

    switch (featureKey) {
      case "pencil":
        path = `/translate/${lessonId}`;
        break;
      case "headphones":
        path = `/listen/${lessonId}`;
        break;
      case "filetext":
        path = `/test/${lessonId}`;
        break;
      default:
        path = `/learn-phrase/${lessonId}`;
    }

    setFromLessonSection(true);
    navigate(path, {
      state: { fromLessonSection: true },
    });
  };

  return (
    <div className={`absolute ${position}`}>
      <FeatureButton icon={icon} isDone={isDone} onClick={handleClick} />
    </div>
  );
};
