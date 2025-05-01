import AnswerResult from "../shared/AnswerResult";

type ChoiceProps = {
  questionTitle: string;
  choices: { id: number; choice: string, is_correct?: boolean }[];
  onSelect: (id: number) => void;
  selectedId: number | null;
  checkResult: "correct" | "incorrect" | null;
  isChecked: boolean;
};

export default function Choice({ questionTitle, choices, onSelect, selectedId, checkResult, isChecked }: ChoiceProps) {
  return (
    <div className="w-full max-w-3xl mx-auto text-center mt-6">
      <h3 className="text-xl font-bold text-gray-700 mb-6">Chọn đáp án đúng</h3>
      <p className="text-4xl font-bold text-cyan_text mb-10">{questionTitle}</p>

      <div className="grid grid-cols-2 gap-6">
        {choices.map((choice, index) => {
          const isSelected = selectedId === choice.id;
          const isDisabled = isChecked;
          const isCorrectChoice = choice.is_correct;

          let buttonStyle = "bg-white border-gray-300 text-cyan_text";
          
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

          return (
            <button
              key={choice.id}
              onClick={() => !isDisabled && onSelect(choice.id)}
              className={`
                flex items-center justify-start gap-2 px-6 py-10 border rounded-xl text-left focus:outline-none text-2xl
                ${buttonStyle}
                ${isDisabled ? "pointer-events-none" : "hover:border-cyan_border hover:bg-cyan_pastel transition-colors"}        
              `}
              disabled={isDisabled}
            >
              <span className={`mr-4 font-bold`}>
                {index + 1}
              </span>
              <span>{choice.choice}</span>
            </button>
          );
        })}
      </div>

      <AnswerResult
        result={checkResult}
        correctText={choices.find(c => c.is_correct)?.choice}
      />
    </div>
  );
}
