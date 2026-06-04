-- ============================================================
-- THE TRACKER — Add Columns for Spreadsheet Exercise Library
-- ============================================================

ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS equipment TEXT;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS alternative_exercise TEXT;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS notes TEXT;
