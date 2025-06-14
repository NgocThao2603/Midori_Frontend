import { useEffect, useState } from "react";
import { fetchQuestionsByLesson, Question } from "../services/api";
import { useParams } from "react-router-dom";
import Template from "../components/questions/Template";
import { useMarkStudiedByLessonId } from "../hooks/useMarkStudiedByLessonId";

const PracticeTranslate = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const lessonIdNumber = Number(lessonId);
  useMarkStudiedByLessonId(lessonIdNumber);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lessonIdNumber) return;

    const loadQuestions = async () => {
      setLoading(true);
      const data = await fetchQuestionsByLesson(lessonIdNumber);
      const filtered = data.filter((q) =>
        q.question_type === "sorting" || q.question_type === "fill_blank"
      );
      setQuestions(filtered);
      setLoading(false);
    };

    loadQuestions();
  }, [lessonIdNumber]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-cyan_border border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (questions.length === 0) return <p className="h-[60vh] flex justify-center text-cyan_text text-2xl">Không có câu hỏi nào.</p>;

  return (
    <Template questions={questions} lessonId={lessonIdNumber} practice_mode="translate"/>
  );
};

export default PracticeTranslate;
