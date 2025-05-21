import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Thay thế bằng URL thực tế của backend
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export interface Chapter {
  id: number;
  title: string;
  level: string;
  lessons: {
    id: number;
    title: string;
  }[];
}

export interface Vocabulary {
  id: number;
  kanji: string;
  hanviet: string;
  kana: string;
  word_type: string;
  meaning: string[];
  phrases: Phrase[];
}

export interface Phrase {
  id: number;
  vocab_id: number;
  phrase: string;
  main_word: string;
  kana?: string;
  prefix?: string;
  suffix?: string;
  meaning: string;
}

export interface Flashcard {
  type: "vocab" | "phrase";
  data: Vocabulary | Phrase;
}

export interface LessonMeaning {
  id: number;
  meaning: string;
  kana?: string;  // chỉ có ở vocab
  type: "vocab" | "phrase" | "example";
}

interface ApiMeaningResponse {
  vocabularies: Array<{
    id: number;
    kana: string;
    meanings: string[];
  }>;
  phrases: Array<{
    id: number; 
    meaning: string;
  }>;
  examples: Array<{
    id: number;
    meaning: string;
  }>;
}

export interface QuestionBase {
  id: number;
  lesson_id: number;
  vocabulary_id: number | null;
  phrase_id: number | null;
  example_id: number | null;
  question: string;
  question_type: "choice" | "matching" | "sorting" | "fill_blank";
  correct_answers: string[] | null;
  hidden_part: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionChoice {
  id: number;
  question_id: number;
  choice: string;
  is_correct: boolean;
}

export interface ExampleToken {
  example_id: number | null;
  id: number;
  jp_token: string;
  vn_token: string;
  token_index: number;
}

export interface QuestionChoiceType extends QuestionBase {
  question_type: "choice" | "matching";
  choices: QuestionChoice[];
}

export interface QuestionSortingType extends QuestionBase {
  question_type: "sorting";
  example_tokens: ExampleToken[];
}

export interface QuestionFillBlankType extends QuestionBase {
  question_type: "fill_blank";
}

export type Question =
  | QuestionChoiceType
  | QuestionSortingType
  | QuestionFillBlankType;

export interface AudioFile {
  id: number;
  vocabulary_id: number | null;
  phrase_id: number | null;
  example_id: number | null;
  example_token_id: number | null;
  audio_url: string;
  audio_type: "vocab" | "phrase" | "example" | "example_token";
  created_at: string;
  updated_at: string;
}

export interface UserPoint {
  point: number;
}

export interface TestInfo {
  id: number;
  title: string;
  total_score: number;
  pass_score: number;
  duration_minutes: number;
}

export interface TestAttempt {
  id: number;
  test_id: number;
  user_id: number;
  status: "in_progress" | "completed" | "abandoned";
  score: number | null;
  start_time: string;
  end_time: string | null;
  answered_count: number;
  created_at: string;
}

// Đăng nhập user
export const loginUser = async (credentials: { email: string; password: string }) => {
  try {
    const response = await api.post("/login", {
      user: {
        email: credentials.email,
        password: credentials.password,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Đăng ký user
export const registerUser = async (data: { username: string; email: string; password: string; password_confirmation: string; dob: string; phone: string }) => {
  try {
    const response = await api.post("/register", { user: data });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Đăng xuất user
export const logoutUser = async () => {
  await api.delete("/logout");
  localStorage.removeItem("token");
};

// Check email username exist
export const checkExist = async (data: { username?: string; email?: string }) => {
  try {
    // Chỉ gửi những tham số có giá trị
    const response = await api.post("/check_existing", {
      username: data.username || "",
      email: data.email || ""
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy chapters lessons
export const fetchChapters = async (level: string) => {
  try {
    const response = await api.get<Chapter[]>("/chapters", {
      params: { level }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLessonStatuses = async () => {
  const res = await api.get("/lesson_statuses", {
    headers: {
      "Accept": "application/json",
      "Cache-Control": "no-cache",
    },
  });
  return res.data as {
    lesson_id: number;
    phrase: boolean;
    translate: boolean;
    listen: boolean;
    test: boolean;
  }[];
};

// Hàm fetch từ vựng theo lessonId
export const fetchVocabulariesByLesson = async (lessonId: string | undefined): Promise<{ vocabList: Vocabulary[], flashcards: Flashcard[] }> => {
  try {
    const response = await axios.get<Vocabulary[]>(`http://localhost:3000/api/vocabularies/lesson/${lessonId}`);
    
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.warn("No valid data received");
      return { vocabList: [], flashcards: [] };
    }

    // Chuẩn hóa dữ liệu để đảm bảo mỗi phrase có `vocab_id`
    const vocabList = response.data.map((vocab) => ({
      ...vocab,
      phrases: vocab.phrases?.map((phrase) => ({ ...phrase, vocab_id: vocab.id })) || [],
    }));

    // Tạo danh sách flashcards (gồm cả từ vựng và cụm từ)
    const flashcards = vocabList.flatMap((vocab) => [
      { type: "vocab" as const, data: vocab },
      ...vocab.phrases.map((phrase) => ({ type: "phrase" as const, data: phrase })),
    ]);

    return { vocabList, flashcards };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { vocabList: [], flashcards: [] };
  }
};

// Fetch câu hỏi theo lesson
export const fetchQuestionsByLesson = async (lessonId: number): Promise<Question[]> => {
  try {
    const response = await api.get(`/questions`, {
      params: {
        lesson_id: lessonId
      }
    });

    const rawQuestions = response.data as any[];

    const questions: Question[] = rawQuestions.map((q) => {
      if (q.question_type === "sorting") {
        return {
          ...q,
          tokens: q.example_tokens
        } as QuestionSortingType;
      }

      if (q.question_type === "choice" || q.question_type === "matching") {
        return {
          ...q,
          choices: q.choices
        } as QuestionChoiceType;
      }

      if (q.question_type === "sorting") {
        return {
          ...q
        } as QuestionFillBlankType;
      }

      return q;
    });
    return questions;
  } catch (error) {
    console.error("Error fetching phrase questions:", error);
    return [];
  }
};

export const fetchLessonMeaningsByLesson = async (lessonId: number): Promise<LessonMeaning[]> => {
  try {
    const response = await api.get<ApiMeaningResponse>(`/lesson_meanings/lesson/${lessonId}`);
    const { vocabularies, phrases, examples } = response.data;
    
    const meanings: LessonMeaning[] = [
      ...vocabularies.map(v => ({
        id: v.id,
        meaning: v.meanings[0], // Lấy meaning đầu tiên
        kana: v.kana,
        type: "vocab" as const
      })),
      ...phrases.map(p => ({
        id: p.id,
        meaning: p.meaning,
        type: "phrase" as const
      })),
      ...examples.map(e => ({
        id: e.id,
        meaning: e.meaning,
        type: "example" as const
      }))
    ];

    return meanings;
  } catch (error) {
    console.error("Error fetching lesson meanings:", error);
    return [];
  }
};

// Lấy điểm hiện tại của user
export const fetchUserPoint = async (): Promise<UserPoint> => {
  try {
    const res = await api.get("/point");
    return res.data;
  } catch (error) {
    console.error("Error fetching user point:", error);
    throw error;
  }
};

// Cập nhật điểm user (tăng/giảm)
export const updateUserPoint = async (data: { point: number; type: "add" | "set" }) => {
  try {
    const response = await api.patch("/point", { 
      user_point: {
        point: data.point,
        update_type: data.type
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user point:", error);
    throw error;
  }
};

export const updateLessonStatus = async (
  lessonId: number,
  type: "phrase" | "translate" | "listen" | "test"
) => {
  try {
    const response = await api.patch(`/lesson_statuses/${lessonId}`, {
      user_exercise_status: {
        exercise_type: type
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating lesson status:", error);
    throw error;
  }
};

export const getTests = async (lessonId: number): Promise<TestInfo>=> {
  try {
    const response = await api.get(`/lessons/${lessonId}/tests`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tests:", error);
    throw error;
  }
};

export const fetchTestAttemptsByTestId = async (testId: number): Promise<TestAttempt[]> => {
  try {
    const response = await api.get(`/test_attempts`, {
      params: { test_id: testId }
    });
    return response.data;
    
  } catch (error) {
    console.error('Error fetching test attempts:', error);
    throw error;
  }
};
