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

export interface UserProfile {
  email: string;
  username: string;
  dob: string;
  phone: string;
  avatar_url: string;
};

export interface RankingUser {
  id: number;
  username: string;
  point: number;
  avatar_url?: string;
}

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
  stt: number;
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
  vocab_stt: number;
  phrase: string;
  main_word: string;
  kana?: string;
  prefix?: string;
  suffix?: string;
  meaning: string;
  phrase_type?: string;
  furigana?: string;
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
  test: {
    pass_score: number;
    id: number;
    lesson_id: number;
    duration_minutes: number;
  };
  questions: {
    question_id: number;
    question_type: "choice" | "matching" | "sorting" | "fill_blank";
  }[];
}

export interface TestAnswer {
  answer_text: any;
  question_id: number;
  answer: string | number | number[];
  is_correct: boolean;
}

export interface UserDailyActivity {
  id: number;
  activity_date: string;
  level: string;
  is_studied: boolean;
  point_earned: number;
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
    const response = await api.get<Vocabulary[]>(`/vocabularies/lesson/${lessonId}`);
    
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
export const fetchQuestionsByLesson = async (lessonId: number, practiceType?: string): Promise<Question[]> => {
  try {
    const response = await api.get(`/questions`, {
      params: {
        lesson_id: lessonId,
        practice_type: practiceType
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
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
    console.error("Error fetching test attempts:", error);
    throw error;
  }
};

export const fetchTestAttempt = async (id: number): Promise<TestAttempt> => {
  try {
    const res = await api.get(`/test_attempts/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching test attempt:", error);
    throw error;
  }
};

export const createTestAttempt = async (test_id: number): Promise<TestAttempt> => {
  try {
    const res = await api.post(`/test_attempts`, { test_id });
    return res.data;
  } catch (error) {
    console.error("Error creating test attempt:", error);
    throw error;
  }
};

export const updateOrCreateTestAnswers = async (testAttemptId: number, answers: TestAnswer[]) => {
  try {
    const response = await api.post(`/test_attempts/${testAttemptId}/test_answers/update_or_create`, {
      test_answer: answers,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTestAnswersByTestAttempt = async (testAttemptId: number): Promise<TestAnswer[]> => {
  try {
    const response = await api.get(`/test_attempts/${testAttemptId}/test_answers`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitTestAttempt = async (testAttemptId: number) => {
  try {
    const response = await api.post(`/test_attempts/${testAttemptId}/submit`);
    return response.data;
  } catch (error) {
    console.error("Error submitting test:", error);
    throw error;
  }
};

export const fetchActivitiesByLevel = async (level: string): Promise<UserDailyActivity[]> => {
  try {
    const response = await api.get("/user_daily_activities", {
      params: { level },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user daily activities for level:", level, error);
    throw error;
  }
};

export const markStudied = async (level: string) => {
  try {
    const response = await api.patch("/user_daily_activities/mark_studied", {
      level 
    });
    return response.data;
  } catch (error) {
    console.error("Error marking studied:", error);
    throw error;
  }
};

export const updateDailyPoint = async (pointEarned: number, level: string) => {
  try {
    const response = await api.patch("/user_daily_activities/update_point", {
      point_earned: pointEarned,
      level
    });
    return response.data;
  } catch (error) {
    console.error("Error updating point:", error);
    throw error;
  }
};

// Lấy bảng xếp hạng tổng thể
export const getOverallRanking = async () => {
  try {
    const response = await api.get("/rankings/overall");
    return response.data;
  } catch (error) {
    console.error("Error fetching overall ranking:", error);
    throw error;
  }
};

// Lấy bảng xếp hạng theo level và thời gian
export const getLevelRanking = async (level: string, period: "day" | "week" | "month") => {
  try {
    const response = await api.get("/rankings/level", {
      params: { level, period }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching level ranking:", error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
}

export const updateProfile = async (data: {
  username?: string;
  dob?: string;
  phone?: string;
  avatar_url?: string;
  password?: string;
  current_password?: string;
}) => {
  try {
    const response = await api.patch("/users", {
      user: data,
    });
    return response.data;
  } catch (error: any) {
    const msg =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Cập nhật thất bại";
    throw new Error(msg);
  }
};
