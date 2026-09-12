-- ====================================================================
-- MIGRATION 002: ROW LEVEL SECURITY & FUNCTIONS FOR SUPABASE
-- ====================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- 2. Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_uid AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger to auto-create profile upon Supabase Auth sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, nim, email, program_studi, whatsapp, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Mahasiswa'),
        COALESCE(NEW.raw_user_meta_data->>'nim', '000000000'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'program_studi', 'Sains dan Teknologi'),
        NEW.raw_user_meta_data->>'whatsapp',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'mahasiswa'::user_role)
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        nim = EXCLUDED.nim,
        program_studi = EXCLUDED.program_studi,
        whatsapp = EXCLUDED.whatsapp;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ====================================================================
-- 4. RLS POLICIES FOR PROFILES
-- ====================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

-- Users can update own profile (except role)
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND (role = 'mahasiswa' OR public.is_admin()));

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
    ON public.profiles FOR UPDATE
    USING (public.is_admin());

-- Users can insert own profile
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ====================================================================
-- 5. RLS POLICIES FOR QUIZZES
-- ====================================================================

-- Authenticated users can view active quizzes
CREATE POLICY "Users can view active quizzes"
    ON public.quizzes FOR SELECT
    USING (is_active = true OR public.is_admin());

-- Admins can manage quizzes (insert, update, delete)
CREATE POLICY "Admins can insert quizzes"
    ON public.quizzes FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update quizzes"
    ON public.quizzes FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete quizzes"
    ON public.quizzes FOR DELETE
    USING (public.is_admin());

-- ====================================================================
-- 6. RLS POLICIES FOR QUESTIONS
-- ====================================================================

-- Authenticated users can view questions of active quizzes
CREATE POLICY "Users can view questions of active quizzes"
    ON public.questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = quiz_id AND (q.is_active = true OR public.is_admin())
        )
    );

-- Admins can manage questions
CREATE POLICY "Admins can insert questions"
    ON public.questions FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update questions"
    ON public.questions FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete questions"
    ON public.questions FOR DELETE
    USING (public.is_admin());

-- ====================================================================
-- 7. RLS POLICIES FOR QUIZ ATTEMPTS
-- ====================================================================

-- Students can view their own attempts
CREATE POLICY "Students can view own attempts"
    ON public.quiz_attempts FOR SELECT
    USING (auth.uid() = student_id OR public.is_admin());

-- Students can create an attempt for active quiz
CREATE POLICY "Students can insert own attempts"
    ON public.quiz_attempts FOR INSERT
    WITH CHECK (
        auth.uid() = student_id AND
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = quiz_id AND q.is_active = true
        )
    );

-- Students can update own in-progress attempt
CREATE POLICY "Students can update own attempts"
    ON public.quiz_attempts FOR UPDATE
    USING (auth.uid() = student_id OR public.is_admin());

-- ====================================================================
-- 8. RLS POLICIES FOR ANSWERS
-- ====================================================================

-- Students can view own answers
CREATE POLICY "Students can view own answers"
    ON public.answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts a
            WHERE a.id = attempt_id AND (a.student_id = auth.uid() OR public.is_admin())
        )
    );

-- Students can insert answers for their active attempt
CREATE POLICY "Students can insert answers to own attempt"
    ON public.answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts a
            WHERE a.id = attempt_id AND a.student_id = auth.uid() AND a.status = 'in_progress'
        )
    );

-- Students can update answers for their active attempt
CREATE POLICY "Students can update answers to own attempt"
    ON public.answers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts a
            WHERE a.id = attempt_id AND a.student_id = auth.uid() AND a.status = 'in_progress'
        )
    );
