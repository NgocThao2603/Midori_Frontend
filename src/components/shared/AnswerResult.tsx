import tick from "../../assets/tick.png";
import close from "../../assets/close.png";
import correctSound from "../../assets/sounds/true.mp3";
import incorrectSound from "../../assets/sounds/false.mp3";
import { useEffect } from "react";

type AnswerResultProps = {
  result: "correct" | "incorrect" | null;
  correctText?: string;
  resultAudioUrl?: string;
};

export default function AnswerResult({ result, correctText, resultAudioUrl }: AnswerResultProps) {
  if (!result) return null;

  const isCorrect = result === "correct";

  useEffect(() => {
    let checkAudio: HTMLAudioElement | null = null;
    let resultAudio: HTMLAudioElement | null = null;

    if (result === "correct") {
      checkAudio = new Audio(correctSound);
    } else if (result === "incorrect") {
      checkAudio = new Audio(incorrectSound);
    }

    if (checkAudio) {
      checkAudio.volume = 0.3;
      checkAudio.play();

      checkAudio.onended = () => {
        if (resultAudioUrl) {
          resultAudio = new Audio(resultAudioUrl);
          resultAudio.volume = 1;
          resultAudio.play();
        }
      };
    }

    return () => {
      checkAudio?.pause();
      checkAudio = null;
      resultAudio?.pause();
      resultAudio = null;
    };
  }, [result, resultAudioUrl]);

  return (
    <div className={`text-center mt-10 ${isCorrect ? "text-secondary" : "text-red_text"}`}>
      <div className="w-24 h-24 flex items-center justify-center mx-auto">
        <img 
          src={isCorrect ? tick : close} 
          alt={isCorrect ? "Correct" : "Incorrect"} 
          className="max-w-full max-h-full object-contain" 
        />
      </div>
      <div
        className={`
          mt-6 p-4 h-[15vh] rounded-xl border-2 inline-block max-w-2xl w-full text-xl mx-auto
          ${isCorrect ? "bg-green_pastel border-green_border text-center flex items-center justify-center font-bold" 
                      : "bg-red_pastel border-red_text text-left flex flex-col justify-center"}
        `}
      >
        {isCorrect ? (
          "Đáp án chính xác!"
        ) : (
          <>
            <span className="ml-10 font-bold">Đáp án chính xác:</span>
            <span className="block text-center w-full mt-2">{correctText}</span>
          </>
        )}
      </div>
    </div>
  );
}
