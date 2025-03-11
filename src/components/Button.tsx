import React from "react";

interface ButtonProps {
  text: string;
  active?: boolean;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ text, active = false, onClick }) => {
  return (
    <button
      className={`w-full px-8 py-4 rounded-xl text-left text-lg font-bold cursor-pointer border hover:border-transparent focus:outline-none ${
        active
          ? "bg-green_pastel text-secondary border-secondary"
          : "text-gray-600 bg-white hover:bg-gray-100 border-transparent"
      }`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Button;
