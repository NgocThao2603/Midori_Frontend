import React from "react";
import ReactCardFlip from "react-card-flip";

interface VocabCardProps {
  id: number;
  kanji: string;
  hanviet: string;
  kana: string;
  word_type: string;
  meaning: string[];
  flipped: boolean;
  onFlip: (id: number) => void;
}

const VocabCard: React.FC<VocabCardProps> = ({ id, kanji, hanviet, kana, word_type, meaning, flipped, onFlip }) => {
  return (
    <ReactCardFlip isFlipped={flipped} flipDirection="horizontal">
      {/* Front Side */}
      <div 
        className="relative w-64 h-96 flex flex-col justify-center items-center rounded-xl border-2 bg-white text-cyan_text cursor-pointer" 
        onClick={() => onFlip(id)}
      >
        <p className="absolute top-4 left-6 text-2xl font-bold">{id}</p>
        <p className="text-4xl font-bold">{kanji}</p>
      </div>
      {/* Back Side */}
      <div 
        className="relative w-64 h-96 flex flex-col justify-center items-center rounded-xl border-2 bg-white text-cyan_text cursor-pointer" 
        onClick={() => onFlip(id)}
      >
        <div className="absolute top-4 left-6 right-6 flex justify-between items-center">
          <p className="text-2xl font-bold">{id}</p>
          <p className="text-secondary font-bold">{word_type}</p>
        </div>

        <p className="text-lg text-gray-600">{kana}</p>
        <p className="text-4xl mt-2 font-bold">{kanji}</p>
        <p className="text-lg text-gray-600 mt-2 uppercase">{hanviet}</p>
        <div className="text-base mt-4 text-cyan_text text-center">
          {meaning.map((m, index) => (
            <p key={index}>{m}</p>
          ))}
        </div>
      </div>
    </ReactCardFlip>
  );
};

export default VocabCard;
