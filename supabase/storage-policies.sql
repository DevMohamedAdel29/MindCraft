-- MindCraft Storage RLS policies
-- Run once in Supabase SQL Editor after schema.sql.

DROP POLICY IF EXISTS "Authenticated users can read assignment files" ON storage.objects;
CREATE POLICY "Authenticated users can read assignment files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'assignment-files');

DROP POLICY IF EXISTS "Admins can manage assignment files" ON storage.objects;
CREATE POLICY "Admins can manage assignment files"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'assignment-files' AND public.is_admin())
WITH CHECK (bucket_id = 'assignment-files' AND public.is_admin());

DROP POLICY IF EXISTS "Students manage own submissions" ON storage.objects;
CREATE POLICY "Students manage own submissions"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'student-submissions' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'student-submissions' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Admins read student submissions" ON storage.objects;
CREATE POLICY "Admins read student submissions"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'student-submissions' AND public.is_admin());

DROP POLICY IF EXISTS "Students manage own exam files" ON storage.objects;
CREATE POLICY "Students manage own exam files"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'exam-answers' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'exam-answers' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Admins read exam files" ON storage.objects;
CREATE POLICY "Admins read exam files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'exam-answers' AND public.is_admin());

DROP POLICY IF EXISTS "Users manage own avatars" ON storage.objects;
CREATE POLICY "Users manage own avatars"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
