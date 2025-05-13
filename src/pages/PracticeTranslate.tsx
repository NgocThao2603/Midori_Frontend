import { useEffect, useState } from "react";
import { fetchQuestionsByLesson, Question } from "../services/api";
import { useParams } from "react-router-dom";
import Template from "../components/questions/Template";

const PracticeTranslate = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const lessonIdNumber = Number(lessonId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lessonIdNumber) return;

    const loadQuestions = async () => {
      setLoading(true);
      const data = await fetchQuestionsByLesson(lessonIdNumber);
      setQuestions(data);
      setLoading(false);
    };

    loadQuestions();
  }, [lessonIdNumber]);

  if (loading) return <p>Đang tải câu hỏi...</p>;
  if (questions.length === 0) return <p>Không có câu hỏi nào.</p>;

  return (
    <Template questions={questions} lessonId={lessonIdNumber} />
  );
};

export default PracticeTranslate;
