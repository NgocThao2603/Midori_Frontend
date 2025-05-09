import React from "react";
import ReactCardFlip from "react-card-flip";
import { Tag } from "antd";

interface VocabCardProps {
  id: number;
  kanji: string;
  hanviet: string;
  kana: string;
  word_type: string;
  meanings: string[];
  flipped: boolean;
  onFlip: (id: number) => void;
}

const wordTypeColors: Record<string, string> = {
  "Danh từ": "green",
  "Động từ": "blue",
  "Động từ ghép": "cyan",
  "Tính từ": "volcano",
  "Phó từ/ Liên từ": "purple",
  "Phó từ/ Liên thể từ": "purple",
  "Katakana": "gold",
};

const VocabCard: React.FC<VocabCardProps> = ({ id, kanji, hanviet, kana, word_type, meanings, flipped, onFlip }) => {
  return (
    <ReactCardFlip isFlipped={flipped} flipDirection="horizontal">
      {/* Front Side */}
      <div 
        className="relative w-64 h-96 px-4 flex flex-col justify-center items-center rounded-xl border-2 bg-white text-cyan_text cursor-pointer" 
        onClick={() => onFlip(id)}
      >
        <p className="absolute top-4 left-6 text-2xl font-bold">{id}</p>
        <p className="text-4xl font-bold">{kanji}</p>
      </div>
      {/* Back Side */}
      <div 
        className="relative w-64 h-96 px-4 flex flex-col justify-center items-center rounded-xl border-2 bg-white text-cyan_text cursor-pointer" 
        onClick={() => onFlip(id)}
      >
        <div className="absolute top-4 left-6 right-2 flex justify-between items-center">
          <p className="text-2xl font-bold">{id}</p>
          <Tag color={wordTypeColors[word_type] || "default"}>{word_type}</Tag>
        </div>

        <p className="text-lg text-gray-600">{kana}</p>
        <p className="text-4xl mt-2 font-bold">{kanji}</p>
        <p className="text-lg text-gray-600 mt-2 uppercase">{hanviet}</p>
        <div className="text-base mt-4 text-cyan_text text-center">
          {meanings.map((m, index) => (
            <p key={index}>{m}</p>
          ))}
        </div>
      </div>
    </ReactCardFlip>
  );
};

export default VocabCard;
