-- ============================================================
-- THE TRACKER — Workout System Refinements & Split Packages
-- Migration: 00009_refine_workout_system.sql
-- ============================================================

-- 1. Create Workout Packages Table
CREATE TABLE IF NOT EXISTS public.workout_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create Workout Package Templates Junction Table
CREATE TABLE IF NOT EXISTS public.workout_package_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    package_id UUID REFERENCES public.workout_packages(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.workout_templates(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (package_id, template_id)
);

-- 3. Drop RPE Column from workout entries
ALTER TABLE public.workout_entries DROP COLUMN IF EXISTS rpe;

-- 4. Map existing exercise categories to restricted Upper, Lower, Cardio split
UPDATE public.exercises SET category = 'Upper' WHERE primary_muscle_group IN ('Chest', 'Back', 'Shoulders', 'Arms');
UPDATE public.exercises SET category = 'Lower' WHERE primary_muscle_group IN ('Legs');
UPDATE public.exercises SET category = 'Cardio' WHERE primary_muscle_group IN ('Core', 'Cardio');
UPDATE public.exercises SET category = 'Upper' WHERE category IS NULL OR category = '';

-- 5. Add check constraint to restrict categories to Upper, Lower, Cardio
ALTER TABLE public.exercises DROP CONSTRAINT IF EXISTS chk_exercise_category;
ALTER TABLE public.exercises ADD CONSTRAINT chk_exercise_category CHECK (
    category IN ('Upper', 'Lower', 'Cardio')
);

-- 6. Create Indexes for package relationships
CREATE INDEX IF NOT EXISTS idx_workout_package_templates_package_id ON public.workout_package_templates(package_id);
CREATE INDEX IF NOT EXISTS idx_workout_package_templates_template_id ON public.workout_package_templates(template_id);

-- 7. Enable Row-Level Security
ALTER TABLE public.workout_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_package_templates ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies
DROP POLICY IF EXISTS "Anyone can view packages" ON public.workout_packages;
CREATE POLICY "Anyone can view packages" ON public.workout_packages
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage packages" ON public.workout_packages;
CREATE POLICY "Admins can manage packages" ON public.workout_packages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Anyone can view package templates" ON public.workout_package_templates;
CREATE POLICY "Anyone can view package templates" ON public.workout_package_templates
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage package templates" ON public.workout_package_templates;
CREATE POLICY "Admins can manage package templates" ON public.workout_package_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- 9. Seed "Upper & Lower Split" Package
INSERT INTO public.workout_packages (id, name, description)
VALUES ('e2e00003-0000-4000-8000-000000000001', 'Upper & Lower Split', 'A classic hypertrophy program dividing upper body and lower body training sessions.')
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description;

-- 10. Link the 6 predefined templates to the Upper & Lower Split Package
INSERT INTO public.workout_package_templates (package_id, template_id)
VALUES
('e2e00003-0000-4000-8000-000000000001', 'e2e00002-0000-4000-8000-000000000001'),
('e2e00003-0000-4000-8000-000000000001', 'e2e00002-0000-4000-8000-000000000002'),
('e2e00003-0000-4000-8000-000000000001', 'e2e00002-0000-4000-8000-000000000003'),
('e2e00003-0000-4000-8000-000000000001', 'e2e00002-0000-4000-8000-000000000004'),
('e2e00003-0000-4000-8000-000000000001', 'e2e00002-0000-4000-8000-000000000005'),
('e2e00003-0000-4000-8000-000000000001', 'e2e00002-0000-4000-8000-000000000006')
ON CONFLICT DO NOTHING;
