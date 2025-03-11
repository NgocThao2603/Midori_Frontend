import React from "react";

interface LessonCardProps {
  chapter: string;
  title: string;
  onStart: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ chapter, title, onStart }) => {
  return (
    <div className="w-2/3 flex justify-between items-center bg-primary text-white p-4 rounded-xl">
      <h2 className="text-lg font-bold ml-6">{chapter} - {title}</h2>
      <button
        className="bg-white text-secondary font-bold px-6 py-3 border-none rounded-lg hover:bg-gray-100"
        onClick={onStart}
      >
        Bắt đầu
      </button>
    </div>
  );
};

export default LessonCard;
