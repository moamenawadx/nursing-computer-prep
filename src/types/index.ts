export type UserRole = "admin" | "student";

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  week: number | null;
  duration_minutes: number | null;
  order_index: number | null;
  video_url: string | null;
  objectives: string[];
  examples: LessonExample[];
  practical_tasks: string[];
  key_points: string[];
  images: LessonImage[];
}

export interface LessonExample {
  title: string;
  description: string;
  code?: string;
}

export interface LessonInput {
  title: string;
  description?: string | null;
  content?: string | null;
  week?: number | null;
  duration_minutes?: number | null;
  order_index?: number | null;
  video_url?: string | null;
  objectives?: string[];
  examples?: LessonExample[];
  practical_tasks?: string[];
  key_points?: string[];
}

export interface LessonImage {
  id: string;
  lesson_id: string;
  image_url: string;
  created_at?: string;
}

export type QuestionType = "mcq" | "truefalse";

export interface Question {
  id: string;
  lesson_id: string;
  text: string;
  type: QuestionType;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  order_index: number | null;
}

export interface QuestionInput {
  lesson_id: string;
  text: string;
  type: QuestionType;
  options: string[];
  correct_answer: string;
  explanation?: string | null;
  order_index?: number | null;
}

export interface ExamAnswer {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface ExamResult {
  id: string;
  user_id: string;
  lesson_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  answers: ExamAnswer[];
  created_at: string;
  lessons?: Pick<Lesson, "title"> | null;
  profiles?: Pick<Profile, "full_name"> | null;
}

export interface Certificate {
  id: string;
  user_id: string;
  lesson_id: string;
  certificate_number: string;
  score: number;
  issued_at: string;
  lessons?: Pick<Lesson, "title"> | null;
  profiles?: Pick<Profile, "full_name"> | null;
}

export interface CertificatePDFData {
  studentName: string;
  lessonTitle: string;
  score: number;
  issueDate: string;
  certificateNumber: string;
  institutionName?: string;
}

export interface AdminResultFilters {
  lessonId?: string;
  userId?: string;
  sortBy?: "score" | "date";
  sortOrder?: "asc" | "desc";
}
