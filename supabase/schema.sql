-- MindCraft PostgreSQL Database Schema with Row Level Security (RLS)
-- Platform: Learn. Create. Master.

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE exam_status AS ENUM ('draft', 'published', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'essay');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attempt_status AS ENUM ('in_progress', 'submitted', 'graded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE submission_status AS ENUM ('submitted', 'graded', 'late');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    student_id TEXT UNIQUE,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Exams Table
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    total_marks INTEGER NOT NULL DEFAULT 100,
    status exam_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    type question_type NOT NULL,
    question_text TEXT NOT NULL,
    marks INTEGER NOT NULL DEFAULT 5,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Question Options Table
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0
);

-- 6. Exam Attempts Table
CREATE TABLE IF NOT EXISTS public.exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    status attempt_status NOT NULL DEFAULT 'in_progress',
    auto_score NUMERIC(5,2) DEFAULT 0,
    manual_score NUMERIC(5,2) DEFAULT 0,
    final_score NUMERIC(5,2) DEFAULT 0
);

-- 7. Answers Table
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
    answer_text TEXT,
    uploaded_file_path TEXT,
    auto_score NUMERIC(5,2) DEFAULT 0,
    manual_score NUMERIC(5,2) DEFAULT 0,
    feedback TEXT
);

-- 8. Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    max_grade INTEGER NOT NULL DEFAULT 100,
    status exam_status NOT NULL DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Assignment Submissions Table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    grade NUMERIC(5,2),
    feedback TEXT,
    status submission_status NOT NULL DEFAULT 'submitted'
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON public.questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON public.question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student_id ON public.exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON public.exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_answers_attempt_id ON public.answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON public.assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are readable by authenticated users"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins have full access to profiles"
ON public.profiles FOR ALL TO authenticated
USING (public.is_admin());

-- Exams Policies
CREATE POLICY "Students can view published exams"
ON public.exams FOR SELECT TO authenticated
USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins can manage exams"
ON public.exams FOR ALL TO authenticated
USING (public.is_admin());

-- Questions Policies
CREATE POLICY "Students can view questions of published exams"
ON public.questions FOR SELECT TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.exams WHERE exams.id = questions.exam_id AND (exams.status = 'published' OR public.is_admin()))
);

CREATE POLICY "Admins can manage questions"
ON public.questions FOR ALL TO authenticated
USING (public.is_admin());

-- Question Options Policies
CREATE POLICY "Students can view options"
ON public.question_options FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.questions q
        JOIN public.exams e ON e.id = q.exam_id
        WHERE q.id = question_options.question_id AND (e.status = 'published' OR public.is_admin())
    )
);

CREATE POLICY "Admins can manage question options"
ON public.question_options FOR ALL TO authenticated
USING (public.is_admin());

-- Exam Attempts Policies
CREATE POLICY "Students can view own attempts"
ON public.exam_attempts FOR SELECT TO authenticated
USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "Students can insert own attempts"
ON public.exam_attempts FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own active attempts"
ON public.exam_attempts FOR UPDATE TO authenticated
USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage attempts"
ON public.exam_attempts FOR ALL TO authenticated
USING (public.is_admin());

-- Answers Policies
CREATE POLICY "Students can view and edit own answers"
ON public.answers FOR ALL TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.exam_attempts WHERE exam_attempts.id = answers.attempt_id AND (exam_attempts.student_id = auth.uid() OR public.is_admin()))
);

-- Assignments Policies
CREATE POLICY "Students can view published assignments"
ON public.assignments FOR SELECT TO authenticated
USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins can manage assignments"
ON public.assignments FOR ALL TO authenticated
USING (public.is_admin());

-- Assignment Submissions Policies
CREATE POLICY "Students can view and submit own assignment solutions"
ON public.assignment_submissions FOR SELECT TO authenticated
USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "Students can insert own assignment submission"
ON public.assignment_submissions FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can update and grade submissions"
ON public.assignment_submissions FOR ALL TO authenticated
USING (public.is_admin());

-- Notifications Policies
CREATE POLICY "Users can manage own notifications"
ON public.notifications FOR ALL TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Supabase Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('assignment-files', 'assignment-files', false),
('student-submissions', 'student-submissions', false),
('exam-answers', 'exam-answers', false),
('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
