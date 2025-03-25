import React from "react";
import ReactCardFlip from "react-card-flip";

interface PhraseCardProps {
  id: number;
  vocab_id: number;
  phrase: string;
  main_word: string;
  kana?: string;
  prefix?: string;
  suffix?: string;
  meaning: string;
  flipped: boolean;
  onFlip: (id: number) => void;
}

const PhraseCard: React.FC<PhraseCardProps> = ({
  id,
  vocab_id,
  phrase,
  main_word,
  kana,
  prefix,
  suffix,
  meaning,
  flipped,
  onFlip,
}) => {
  return (
    <ReactCardFlip isFlipped={flipped} flipDirection="horizontal">
      {/* Front Side */}
      <div 
        className="relative w-64 h-96 flex flex-col justify-center items-center rounded-xl border-2 bg-white text-cyan_text cursor-pointer" 
        onClick={() => onFlip(id)}
      >
        <p className="absolute top-4 left-6 text-2xl font-bold">{vocab_id}</p>
        <p className="text-4xl font-bold">{phrase}</p>
      </div>
      {/* Back Side */}
      <div 
        className="relative w-64 h-96 flex flex-col justify-center items-center rounded-xl border-2 bg-white text-cyan_text cursor-pointer" 
        onClick={() => onFlip(id)}
      >
        <div className="absolute top-4 left-6 right-6 flex justify-between items-center">
          <p className="text-2xl font-bold">{vocab_id}</p>
        </div>

        {kana && <p className="text-lg text-gray-600 mt-2">{kana}</p>}
        <p className="text-4xl mt-2 font-bold">
          {phrase}
        </p>
        <div className="text-base mt-4 text-cyan_text text-center">
          <p>{meaning}</p>
        </div>
      </div>
    </ReactCardFlip>
  );
};

export default PhraseCard;
