export type UserRole = 'admin' | 'student';
export type ExamStatus = 'draft' | 'published' | 'closed';
export type QuestionType = 'multiple_choice' | 'true_false' | 'essay';
export type AttemptStatus = 'in_progress' | 'submitted' | 'graded';
export type SubmissionStatus = 'submitted' | 'graded' | 'late';
export type NotificationType = 'info' | 'success' | 'warning' | 'alert';

export const GRADE_LEVELS = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
] as const;

export type GradeLevel = typeof GRADE_LEVELS[number];

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  student_id?: string;
  role: UserRole;
  grade_level?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_marks: number;
  status: ExamStatus;
  target_grade?: string; // 'All Grades' or specific grade like 'Grade 9'
  created_by?: string;
  created_at: string;
  updated_at: string;
  questions?: Question[];
  question_count?: number;
}

export interface Question {
  id: string;
  exam_id: string;
  type: QuestionType;
  question_text: string;
  marks: number;
  order_index: number;
  created_at: string;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  student_id: string;
  started_at: string;
  submitted_at?: string | null;
  status: AttemptStatus;
  auto_score: number;
  manual_score: number;
  final_score: number;
  exam?: Exam;
  student?: Profile;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id?: string | null;
  answer_text?: string | null;
  uploaded_file_path?: string | null;
  uploaded_file_name?: string | null;
  auto_score: number;
  manual_score: number;
  feedback?: string | null;
  question?: Question;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  file_path?: string | null;
  file_name?: string | null;
  due_date: string;
  max_grade: number;
  status: ExamStatus;
  target_grade?: string; // 'All Grades' or specific grade like 'Grade 9'
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  file_path: string;
  file_name: string;
  file_size?: number;
  file_type?: string;
  submitted_at: string;
  grade?: number | null;
  feedback?: string | null;
  status: SubmissionStatus;
  assignment?: Assignment;
  student?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface StoredFile {
  id: string;
  bucket: 'assignment-files' | 'student-submissions' | 'exam-answers' | 'avatars';
  name: string;
  size: number;
  type: string;
  dataUrl: string; // Base64 or Blob URL for instant reliable preview/download
  uploaded_at: string;
  owner_id: string;
}
