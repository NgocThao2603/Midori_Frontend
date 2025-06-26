import AnswerResult from "../shared/AnswerResult";
import { AudioFile } from "../../services/api";
import { useEffect } from "react";
import { useQuestionAudio } from "../../hooks/useQuestionAudio";

type ChoiceProps = {
  questionTitle: string;
  choices: { id: number; choice: string, is_correct?: boolean }[];
  onSelect: (id: number) => void;
  savedAnswer?: number;
  selectedId: number | null;
  checkResult?: "correct" | "incorrect" | null;
  isChecked?: boolean;
  audioFiles: AudioFile[];
  vocabId?: number;
  phraseId?: number;
  exampleId?: number;
  meaning?: string;
  doMode: "practice" | "test";
};

export default function Choice({
  questionTitle, 
  choices, 
  savedAnswer,
  onSelect, 
  selectedId,
  checkResult,
  isChecked = false,
  audioFiles,
  vocabId,
  phraseId,
  exampleId,
  meaning,
  doMode
}: ChoiceProps) {
  const questionAudio = audioFiles.find(
    (file) => (file.audio_type === "vocab" && file.vocabulary_id === vocabId) ||
              (file.audio_type === "phrase" && file.phrase_id === phraseId) ||               
              (file.audio_type === "example" && file.example_id === exampleId)
  );

  useEffect(() => {
    if (savedAnswer !== undefined && selectedId === null) {
      onSelect(savedAnswer);
    }
  }, [savedAnswer, selectedId, onSelect]);

  const handleSelect = (id: number) => {
    if (doMode === "test" || !isChecked) {
      onSelect(id);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-center mt-6">
      <h3 className="text-xl font-bold text-gray-700 mb-6">Chọn đáp án đúng</h3>
      <p className="text-4xl font-bold text-cyan_text mb-10">{questionTitle}</p>

      <div className="grid grid-cols-2 gap-6">
        {choices.map((choice, index) => {
          const isSelected = selectedId === choice.id || 
                           (savedAnswer !== undefined && savedAnswer === choice.id);
          const isCorrectChoice = choice.is_correct;

          let buttonStyle = "bg-white border-gray-300 text-cyan_text";
          
          // Trong test mode, chỉ highlight selection mà không hiển thị correct/incorrect
          if (doMode === "test") {
            if (isSelected) {
              buttonStyle = "bg-cyan_pastel border-cyan_border text-cyan_text";
            }
          } else {
            // Practice mode - hiển thị kết quả sau khi check
            if (isSelected && !isChecked) {
              buttonStyle = "bg-cyan_pastel border-cyan_border text-cyan_text";
            }
            
            if (isChecked) {
              if (isCorrectChoice) {
                buttonStyle = "bg-green_pastel border-secondary text-secondary";
              }

              if (isSelected && !isCorrectChoice) {
                buttonStyle = "bg-red_pastel border-red_text text-red_text";
              }
            }
          }

          return (
            <button
              key={choice.id}
              onClick={() => handleSelect(choice.id)}
              className={`
                flex items-center justify-start gap-2 px-6 py-10 border rounded-xl text-left focus:outline-none text-2xl
                ${buttonStyle}
                ${doMode === "practice" && isChecked ? "pointer-events-none" : "hover:border-cyan_border hover:bg-cyan_pastel transition-colors"}        
              `}
              disabled={doMode === "practice" && isChecked}
            >
              <span className={`mr-4 font-bold`}>
                {index + 1}
              </span>
              <span>{choice.choice}</span>
            </button>
          );
        })}
      </div>

      {doMode === "practice" && (
        <AnswerResult
          result={checkResult ?? null}
          correctText={choices.find(c => c.is_correct)?.choice}
          resultAudioUrl={questionAudio?.audio_url}
          meaning={meaning}
        />
      )}
    </div>
  );
}
