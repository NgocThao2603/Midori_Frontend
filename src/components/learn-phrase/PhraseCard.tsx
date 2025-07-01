import React from "react";
import ReactCardFlip from "react-card-flip";
import { Tag } from "antd";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

interface PhraseCardProps {
  id: number;
  vocab_id: number;
  vocab_stt: number;
  phrase: string;
  main_word: string;
  prefix?: string;
  suffix?: string;
  meaning: string;
  phrase_type: string;
  furigana?: string;
  flipped: boolean;
  onFlip: (id: number) => void;
  playAudio?: (phraseId: number) => void;
}

const phraseTypeColors: Record<string, string> = {
  "名": "green",
  "連": "blue",
  "関": "cyan",
  "類": "volcano",
  "合": "purple",
  "対": "gold",
};

const PhraseCard: React.FC<PhraseCardProps> = ({
  id,
  vocab_id,
  vocab_stt,
  phrase,
  main_word,
  prefix,
  suffix,
  meaning,
  phrase_type,
  furigana,
  flipped,
  onFlip,
  playAudio
}) => {
  return (
    <ReactCardFlip isFlipped={flipped} flipDirection="horizontal">
      {/* Front Side */}
      <div 
        className="relative w-64 h-96 px-4 flex flex-col justify-center items-center rounded-xl border-2 bg-white text-cyan_text cursor-pointer" 
        onClick={() => onFlip(id)}
      >
        <p className="absolute top-4 left-6 text-2xl font-bold">{vocab_stt}</p>
        <p className="text-4xl font-bold">{phrase}</p>
        <div 
          className="absolute -bottom-8 items-center bg-cyan_pastel border border-cyan_border p-4 rounded-full"
          onClick={e => {
            e.stopPropagation();
            playAudio?.(id);
          }}
        >
          <VolumeUpIcon style={{ width: 40, height: 40 }} />
        </div>
      </div>
      {/* Back Side */}
      <div 
        className="relative w-64 h-96 px-4 flex flex-col justify-center items-center rounded-xl border-2 bg-white text-cyan_text cursor-pointer" 
        onClick={() => onFlip(id)}
      >
        <div className="absolute top-4 left-6 right-2 flex justify-between items-center">
          <p className="text-2xl font-bold">{vocab_stt}</p>
          <Tag color={phraseTypeColors[phrase_type] || "default"} className="text-lg px-3 py-1 rounded-md">{phrase_type}</Tag>
        </div>
        {furigana && <p className="text-lg text-gray-600 mt-2">{furigana}</p>}
        <p className="text-4xl mt-2 font-bold">
          {phrase}
        </p>
        <div className="text-base mt-4 text-cyan_text text-center">
          <p>{meaning}</p>
        </div>

        <div 
          className="absolute -bottom-8 items-center bg-cyan_pastel border border-cyan_border p-4 rounded-full"
          onClick={e => {
            e.stopPropagation();
            playAudio?.(id);
          }}
        >
          <VolumeUpIcon style={{ width: 40, height: 40 }} />
        </div>
      </div>
    </ReactCardFlip>
  );
};

export default PhraseCard;
