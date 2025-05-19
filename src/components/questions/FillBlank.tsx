import React, { useState, useRef, useEffect } from "react";
import AnswerResult from "../shared/AnswerResult";
import { AudioFile } from "../../services/api";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

type FillBlankProps = {
  questionTitle: string;
  onSelect: (answer: string) => void;
  isChecked: boolean;
  checkResult: "correct" | "incorrect" | null;
  correct_answers: string[] | null;
  audioFiles: AudioFile[];
  mode: "translate" | "listen";
  meaning?: string;
};

export default function FillBlank({
  questionTitle,
  onSelect,
  isChecked,
  checkResult,
  correct_answers = [],
  audioFiles,
  mode,
  meaning
}: FillBlankProps) {
  const [answer, setAnswer] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = (url: string) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    const audio = new Audio(url);
    currentAudioRef.current = audio;
    audio.volume = 1;
    audio.play();
  };

  const questionAudio = audioFiles.find(
    (file) => file.audio_type === "example"
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswer = e.target.value;
    setAnswer(newAnswer);
    onSelect(newAnswer);
  };

  const getTextareaStyle = (): string => {
    if (!isChecked) {
      return "border-cyan_border bg-cyan_pastel text-cyan_text";
    }
    if (checkResult === "correct") {
      return "border-secondary bg-green_pastel text-secondary";
    }
    if (checkResult === "incorrect") {
      return "border-red_text bg-red_pastel text-red_text";
    }
    return "border-gray-300 bg-white text-cyan_text";
  };

  // Auto resize textarea, max 8 lines
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight || "24");
      const maxHeight = lineHeight * 8;
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
    }
  }, [answer]);

  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mode === "listen") {
      if (questionAudio) {
        playAudio(questionAudio.audio_url);
      }
    }
  }, [ audioFiles]);

  return (
    <div className="w-full max-w-3xl mx-auto text-center mt-6">
      {mode === "translate" && (
        <div>
          <h3 className="text-xl font-bold text-gray-700 mb-6">Dịch sang tiếng Nhật</h3>
          <p className="text-2xl font-bold text-cyan_text mb-10">{questionTitle}</p>
        </div>
      )}

      {mode === "listen" && (
        <div>
          <h3 className="text-xl font-bold text-gray-700 mb-6">Nghe và dịch sang tiếng Nhật</h3>
          {(() => {
            return questionAudio ? (
              <div
                onClick={() => playAudio(questionAudio.audio_url)}
                className="ml-[10%] mb-10 w-24 h-24 mx-auto cursor-pointer text-cyan_text hover:scale-110 transition-transform duration-200"
              >
                <VolumeUpIcon style={{ width: "100%", height: "100%" }} />
              </div>
            ) : null;
          })()}
        </div>
      )}  

      <div className="flex flex-col items-center gap-4">
        <textarea
          ref={textareaRef}
          className={`w-[80%] px-4 py-2 text-xl border-b-2 focus:outline-none resize-none overflow-auto leading-snug scrollbar-hide overflow-auto ${getTextareaStyle()}`}
          rows={1}
          value={answer}
          onChange={handleInputChange}
          placeholder="Nhập câu trả lời..."
          disabled={isChecked}
        />
      </div>

      <AnswerResult
        result={checkResult}
        correctText={
          isChecked && checkResult === "incorrect"
            ? correct_answers?.join(", ") || undefined
            : undefined
        }
        resultAudioUrl={questionAudio?.audio_url}
        meaning={meaning}
      />
    </div>
  );
}
