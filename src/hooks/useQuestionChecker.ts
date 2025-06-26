import { useState, useCallback } from "react";
import { Question } from "../services/api";

export type UserAnswer = string | number | number[] | string[] | null;
export type CheckResult = "correct" | "incorrect" | null;

type UserAnswersState = {
  [questionId: number]: UserAnswer;
};

type ResultsState = {
  [questionId: number]: CheckResult;
};

export function useQuestionChecker(questions: Question[], doMode: "practice" | "test" = "practice") {
  const [userAnswers, setUserAnswers] = useState<UserAnswersState>({});
  const [results, setResults] = useState<ResultsState>({});
  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  const setAnswer = useCallback((questionId: number, answer: UserAnswer) => {
    // Trong practice mode, không cho phép thay đổi đáp án sau khi đã kiểm tra
    if (doMode === "practice" && checkedIds.includes(questionId)) {
      return;
    }  
    // Trong test mode, cho phép thay đổi đáp án
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
    // Nếu là test mode và câu hỏi đã được kiểm tra, xóa kết quả cũ khi đáp án thay đổi
    if (doMode === "test" && checkedIds.includes(questionId)) {
      setResults((prev) => {
        const newResults = { ...prev };
        delete newResults[questionId];
        return newResults;
      });
      setCheckedIds((prev) => prev.filter(id => id !== questionId));
    }
  }, [doMode, checkedIds]);

  const checkAnswer = useCallback((questionId: number) => {
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
    }      

    else if (question.question_type === "fill_blank") {
      const correctAnswer = question.correct_answers?.[0] || "";
      const userText = typeof userAnswer === "string" ? userAnswer : "";
      
      // Normalize strings để so sánh
      const normalizeString = (str: string) => {
        return str
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
          .replace(/\u3000/g, ' ');
      };

      const normalizedCorrect = normalizeString(correctAnswer);  
      const normalizedUser = normalizeString(userText);
      
      isCorrect = normalizedCorrect === normalizedUser;
    }

    // else if (question.question_type === "sorting") {
    //   const userOrder = Array.isArray(userAnswer) ? userAnswer : [];
    
    //   // Lấy danh sách ID theo thứ tự đúng từ token_index
    //   const correctOrder = (question.example_tokens || [])
    //     .filter(t => typeof t.token_index === "number")
    //     .sort((a, b) => (a.token_index! - b.token_index!))
    //     .map(t => t.id);
    
    //   isCorrect =
    //     correctOrder.length === userOrder.length &&
    //     correctOrder.every((id, index) => id === userOrder[index]);
    // }
    else if (question.question_type === "sorting") {
      const userOrder = Array.isArray(userAnswer) ? userAnswer : [];

      const allowedDuplicateSurfaces = ["の", "が", "に", "を", "は", "と", "も", "で", "から", "まで"];

      const correctTokens = (question.example_tokens || [])
        .filter(t => typeof t.token_index === "number")
        .sort((a, b) => a.token_index! - b.token_index!);

      // Lấy token theo id để so sánh
      const tokenMap = new Map(correctTokens.map(t => [t.id, t]));

      // Check chiều dài
      if (correctTokens.length !== userOrder.length) {
        isCorrect = false;
      } else {
        // So sánh từng phần tử theo index
        isCorrect = correctTokens.every((correctToken, index) => {
          const userTokenId = userOrder[index];
          if (typeof userTokenId !== "number") return false;
          const userToken = tokenMap.get(userTokenId);

          if (!userToken) return false;

          // Nếu là trợ từ có thể trùng, chỉ cần đúng surface
          if (allowedDuplicateSurfaces.includes(correctToken.jp_token)) {
            return correctToken.jp_token === userToken.jp_token;
          }

          // Ngược lại phải đúng ID
          return correctToken.id === userTokenId;
        });
      }
    }

    setResults((prev) => ({
      ...prev,
      [questionId]: isCorrect ? "correct" : "incorrect"
    }));

    setCheckedIds((prev) => [...prev, questionId]);
  }, [questions, userAnswers]);

  const isChecked = useCallback((questionId: number) => checkedIds.includes(questionId), [checkedIds]);

  const reset = useCallback(() => {
    setUserAnswers({});
    setResults({});
    setCheckedIds([]);
  }, []);

  // QUAN TRỌNG: Sử dụng useCallback để function không thay đổi reference
  const setInitialAnswers = useCallback((answersMap: { [key: number]: UserAnswer }) => {
    setUserAnswers(prev => ({ ...prev, ...answersMap }));
  }, []);

  return {
    userAnswers,
    results,
    isChecked,
    setAnswer,
    checkAnswer,
    reset,
    setInitialAnswers,
  };
}
