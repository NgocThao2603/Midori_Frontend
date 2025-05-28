import { useEffect, useState } from "react";
import { fetchQuestionsByLesson, fetchLessonMeaningsByLesson, fetchTestAttempt, LessonMeaning, Question, TestAttempt } from "../services/api";
import { useParams } from "react-router-dom";
import TestDetail from "../components/test_attempts/TestDetail";

const AttemptDetail = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const attemptIdNumber = Number(attemptId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [lessonMeanings, setLessonMeanings] = useState<LessonMeaning[]>([]);
  const [testAttempt, setTestAttempt] = useState<TestAttempt | null>(null);

  useEffect(() => {
    if (!attemptIdNumber) return;

    const loadQuestionsFromAttempt = async () => {
      try {
        setLoading(true);
        const attemptData = await fetchTestAttempt(attemptIdNumber);
        if (!attemptData?.test?.lesson_id) {
          console.error("Invalid test attempt data");
          return;
        }
        setTestAttempt(attemptData);
        // Lấy tất cả câu hỏi của lesson một lần
        const allQuestions = await fetchQuestionsByLesson(attemptData.test.lesson_id);
        
        // Lọc ra các câu hỏi cần thiết
        const questionsDetailed = attemptData.questions
          .map(q => allQuestions.find(question => question.id === q.question_id))
          .filter((q): q is Question => q !== undefined);

        setQuestions(questionsDetailed);

        // Lấy meanings cho bài test
        const meaningsData = await fetchLessonMeaningsByLesson(attemptData.test.lesson_id);
        setLessonMeanings(meaningsData);

      } catch (error) {
        console.error("Error loading test attempt questions:", error);
        setQuestions([]);
        setLessonMeanings([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuestionsFromAttempt();
  }, [attemptIdNumber]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-cyan_border border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (questions.length === 0 || !testAttempt) 
    return <p className="h-[60vh] flex justify-center text-cyan_text text-2xl">Không có câu hỏi nào.</p>;

  return (
    <div>
      <TestDetail 
        questions={questions}
        lessonId={Number(testAttempt.test.lesson_id)}
        attemptId={Number(attemptId)} 
        lessonMeanings={lessonMeanings} 
      />
    </div>
  );
};

export default AttemptDetail;
