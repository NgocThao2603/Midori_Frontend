import { useEffect, useState } from "react";
import { fetchLessonMeaningsByLesson, fetchQuestionsByLesson, LessonMeaning, Question } from "../services/api";
import { useParams } from "react-router-dom";
import Template from "../components/questions/Template";
import { useMarkStudiedByLessonId } from "../hooks/useMarkStudiedByLessonId";

const PracticePhrase = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const lessonIdNumber = Number(lessonId);
  useMarkStudiedByLessonId(lessonIdNumber);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [lessonMeanings, setLessonMeanings] = useState<LessonMeaning[]>([]);
  useEffect(() => {
    if (!lessonIdNumber) return;

    const loadQuestions = async () => {
      try {
        setLoading(true);
        const [questionsData, meaningsData] = await Promise.all([
          fetchQuestionsByLesson(lessonIdNumber, "phrase"),  // Thêm param practice_type
          fetchLessonMeaningsByLesson(lessonIdNumber)
        ]);
        
        setQuestions(questionsData);
        setLessonMeanings(meaningsData || []);
      } catch (error) {
        console.error("Error loading questions or meanings:", error);
        setQuestions([]);
        setLessonMeanings([]);
      } finally {
        setLoading(false);
      }
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
    <Template questions={questions} lessonId={lessonIdNumber} lessonMeanings={lessonMeanings} practice_mode="phrase"/>
  );
};

export default PracticePhrase;
