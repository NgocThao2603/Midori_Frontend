import React from "react";
import { LucideIcon } from "lucide-react";

interface FeatureButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  isDone: boolean;
}

const FeatureButton: React.FC<FeatureButtonProps> = ({ icon: Icon, onClick, isDone }) => {
  return (
    <div className="relative flex justify-center">
      <div
        className={`absolute bottom-[-15px] w-[120px] h-[100px] rounded-[50%] ${
          isDone ? "bg-green_pastel" : "bg-gray-300"
        }`}
      ></div>
      <button
        className={`w-[120px] h-[100px] border-2 rounded-[50%] flex items-center justify-center z-20 hover:border-none focus:outline-none ${
          isDone ? "bg-green_bg border-secondary" : "bg-gray-200 border-gray-400"
        }`}
        onClick={onClick}
      >
        <Icon size={40} className={isDone ? "text-secondary" : "text-gray-500"} />
      </button>
    </div>
  );
};

export default FeatureButton;
