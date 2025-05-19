import React from "react";

interface ButtonProps {
  text: string;
  img?: string;
  active?: boolean;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ text, img, active = false, onClick }) => {
  return (
    <button
      className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl text-left text-lg font-bold border hover:border-transparent focus:outline-none ${
        active
          ? "bg-green_pastel text-secondary !border-secondary hover:border-secondary"
          : "text-gray-600 bg-white hover:bg-gray-100 border-transparent cursor-pointer"
      }`}
      onClick={onClick}
    >
      {img && <img src={img} alt="" className="w-10 h-10"/>}
      <span>{text}</span>
    </button>
  );
};

export default Button;
