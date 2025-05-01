import { useState } from "react";
import { Question } from "../services/api";

export type UserAnswer = string | number | number[] | string[] | null;
export type CheckResult = "correct" | "incorrect" | null;

type UserAnswersState = {
  [questionId: number]: UserAnswer;
};

type ResultsState = {
  [questionId: number]: CheckResult;
};

export function useQuestionChecker(questions: Question[]) {
  const [userAnswers, setUserAnswers] = useState<UserAnswersState>({});
  const [results, setResults] = useState<ResultsState>({});
  const [isChecked, setIsChecked] = useState(false);

  const setAnswer = (questionId: number, answer: UserAnswer) => {
    if (!isChecked) {
      setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
    }
  };

  const checkAnswers = () => {
    const newResults: ResultsState = {};

    questions.forEach((question) => {
      const userAnswer = userAnswers[question.id];

      let isCorrect = false;

      if (question.question_type === "choice") {
        const correctChoice = question.choices?.find((c) => c.is_correct);
        isCorrect = userAnswer === correctChoice?.id;
      }

      else if (question.question_type === "fill_blank") {
        // const correctText = question.correct_text?.trim().toLowerCase();
        // const userText = typeof userAnswer === "string" ? userAnswer.trim().toLowerCase() : "";
        // isCorrect = correctText === userText;
      }

      else if (question.question_type === "sorting") {
        // const correctOrder = question.correct_order || [];
        // const userOrder = Array.isArray(userAnswer) ? userAnswer : [];
        // isCorrect = JSON.stringify(correctOrder) === JSON.stringify(userOrder);
      }

      // Mặc định là sai nếu chưa có đáp án hoặc chưa hỗ trợ
      newResults[question.id] = isCorrect ? "correct" : "incorrect";
    });

    setResults(newResults);
    setIsChecked(true);
  };

  const reset = () => {
    setUserAnswers({});
    setResults({});
    setIsChecked(false);
  };

  return {
    userAnswers,
    results,
    isChecked,
    setAnswer,
    checkAnswers,
    reset,
  };
}
