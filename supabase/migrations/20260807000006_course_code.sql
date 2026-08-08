-- Migration: Replace course_id foreign key with course_code text column and drop courses table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS course_code TEXT;
ALTER TABLE public.posts DROP COLUMN IF EXISTS course_id;
DROP TABLE IF EXISTS public.courses CASCADE;
