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
  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  const setAnswer = (questionId: number, answer: UserAnswer) => {
    if (!checkedIds.includes(questionId)) {
      setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
    }
  };

  const checkAnswer = (questionId: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const userAnswer = userAnswers[questionId];
    let isCorrect = false;

    if (question.question_type === "choice") {
      const correctChoice = question.choices?.find((c) => c.is_correct);
      isCorrect = userAnswer === correctChoice?.id;
    }

    else if (question.question_type === "matching") {
      const correctIds = question.choices?.filter(c => c.is_correct).map(c => c.id) || [];
      const userIds = Array.isArray(userAnswer) ? userAnswer : [];
    
      isCorrect =
        correctIds.length === userIds.length &&
        correctIds.every((id, index) => userIds[index] === id);

      // Cach 2: So sanh text thay vi dung is_correct
      
      // const correctAnswers = question.correct_answers || [];
      // const userIds = Array.isArray(userAnswer) ? userAnswer : [];
      // const correctIds = correctAnswers.map(correctValue => {
      //   const correctChoice = question.choices?.find(c => c.choice === correctValue);
      //   return correctChoice?.id;
      // });
      // isCorrect = 
      //   correctIds.length === userIds.length &&
      //   correctIds.every((id, index) => id === userIds[index]);
    }      

    // else if (question.question_type === "fill_blank") {
    //   const correctText = question.correct_text?.trim().toLowerCase();
    //   const userText = typeof userAnswer === "string" ? userAnswer.trim().toLowerCase() : "";
    //   isCorrect = correctText === userText;
    // }

    // else if (question.question_type === "sorting") {
    //   const correctOrder = question.correct_order || [];
    //   const userOrder = Array.isArray(userAnswer) ? userAnswer : [];
    //   isCorrect = JSON.stringify(correctOrder) === JSON.stringify(userOrder);
    // }

    setResults((prev) => ({
      ...prev,
      [questionId]: isCorrect ? "correct" : "incorrect"
    }));

    setCheckedIds((prev) => [...prev, questionId]);
  };

  const isChecked = (questionId: number) => checkedIds.includes(questionId);

  const reset = () => {
    setUserAnswers({});
    setResults({});
    setCheckedIds([]);
  };

  return {
    userAnswers,
    results,
    isChecked,
    setAnswer,
    checkAnswer,
    reset,
  };
}
