-- ============================================================
-- THE TRACKER — Predefined Workout Templates Schema
-- Migration: 00007_workout_templates.sql
-- ============================================================

-- 1. Create Workout Templates Table
CREATE TABLE IF NOT EXISTS public.workout_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    estimated_duration INTEGER DEFAULT 60 NOT NULL, -- in minutes
    muscle_focus TEXT DEFAULT 'Full Body' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create Workout Template Exercises Junction Table
CREATE TABLE IF NOT EXISTS public.workout_template_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES public.workout_templates(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    exercise_order INTEGER NOT NULL,
    sequence_number INTEGER NOT NULL,
    target_sets INTEGER DEFAULT 3 NOT NULL,
    target_reps TEXT DEFAULT '10-12' NOT NULL,
    warmup_sets INTEGER DEFAULT 0 NOT NULL,
    working_sets INTEGER DEFAULT 3 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Add template link column to logged workouts if not exists
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.workout_templates(id) ON DELETE SET NULL;

-- 4. Add set type column to workout entries if not exists
ALTER TABLE public.workout_entries ADD COLUMN IF NOT EXISTS set_type TEXT DEFAULT 'working' NOT NULL;
ALTER TABLE public.workout_entries DROP CONSTRAINT IF EXISTS chk_set_type;
ALTER TABLE public.workout_entries ADD CONSTRAINT chk_set_type CHECK (
    set_type IN ('warmup', 'working', 'top', 'failure')
);

-- 5. Create Indexes for optimization
CREATE INDEX IF NOT EXISTS idx_workout_templates_user_id ON public.workout_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_template_exercises_template_id ON public.workout_template_exercises(template_id);
CREATE INDEX IF NOT EXISTS idx_workout_template_exercises_exercise_id ON public.workout_template_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workouts_template_id ON public.workouts(template_id);

-- 6. Trigger to sync sequence_number and exercise_order to ensure compatibility with frontend
CREATE OR REPLACE FUNCTION public.sync_template_exercise_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sequence_number IS NULL AND NEW.exercise_order IS NOT NULL THEN
    NEW.sequence_number := NEW.exercise_order;
  ELSIF NEW.exercise_order IS NULL AND NEW.sequence_number IS NOT NULL THEN
    NEW.exercise_order := NEW.sequence_number;
  ELSIF NEW.sequence_number IS NOT NULL AND NEW.exercise_order IS NOT NULL THEN
    -- If both are set, make sure they are identical (prefer sequence_number as source of truth from client)
    NEW.exercise_order := NEW.sequence_number;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_template_exercise_order_trigger ON public.workout_template_exercises;
CREATE TRIGGER sync_template_exercise_order_trigger
BEFORE INSERT OR UPDATE ON public.workout_template_exercises
FOR EACH ROW EXECUTE FUNCTION public.sync_template_exercise_order();

-- 7. Enable Row-Level Security
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_template_exercises ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for workout_templates
DROP POLICY IF EXISTS "Users can view templates" ON public.workout_templates;
CREATE POLICY "Users can view templates"
    ON public.workout_templates FOR SELECT
    USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own templates" ON public.workout_templates;
CREATE POLICY "Users can create own templates"
    ON public.workout_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own templates" ON public.workout_templates;
CREATE POLICY "Users can update own templates"
    ON public.workout_templates FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own templates" ON public.workout_templates;
CREATE POLICY "Users can delete own templates"
    ON public.workout_templates FOR DELETE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage templates" ON public.workout_templates;
CREATE POLICY "Admins can manage templates"
    ON public.workout_templates FOR ALL
    USING (
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

-- 9. RLS Policies for workout_template_exercises
DROP POLICY IF EXISTS "Users can view template exercises" ON public.workout_template_exercises;
CREATE POLICY "Users can view template exercises"
    ON public.workout_template_exercises FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workout_templates
            WHERE workout_templates.id = workout_template_exercises.template_id
            AND (workout_templates.user_id IS NULL OR auth.uid() = workout_templates.user_id)
        )
    );

DROP POLICY IF EXISTS "Users manage own template exercises" ON public.workout_template_exercises;
CREATE POLICY "Users manage own template exercises"
    ON public.workout_template_exercises FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workout_templates
            WHERE workout_templates.id = workout_template_exercises.template_id
            AND auth.uid() = workout_templates.user_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workout_templates
            WHERE workout_templates.id = workout_template_exercises.template_id
            AND auth.uid() = workout_templates.user_id
        )
    );

DROP POLICY IF EXISTS "Admins manage template exercises" ON public.workout_template_exercises;
CREATE POLICY "Admins manage template exercises"
    ON public.workout_template_exercises FOR ALL
    USING (
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

-- 10. Seed predefined workout templates
-- Clear any existing template seeds first
DELETE FROM public.workout_template_exercises WHERE template_id IN (
    'e2e00002-0000-4000-8000-000000000001',
    'e2e00002-0000-4000-8000-000000000002',
    'e2e00002-0000-4000-8000-000000000003',
    'e2e00002-0000-4000-8000-000000000004',
    'e2e00002-0000-4000-8000-000000000005',
    'e2e00002-0000-4000-8000-000000000006'
);
DELETE FROM public.workout_templates WHERE id IN (
    'e2e00002-0000-4000-8000-000000000001',
    'e2e00002-0000-4000-8000-000000000002',
    'e2e00002-0000-4000-8000-000000000003',
    'e2e00002-0000-4000-8000-000000000004',
    'e2e00002-0000-4000-8000-000000000005',
    'e2e00002-0000-4000-8000-000000000006'
);

INSERT INTO public.workout_templates (id, user_id, name, description, estimated_duration, muscle_focus) VALUES
('e2e00002-0000-4000-8000-000000000001', NULL, 'Upper A', 'Hypertrophy rotation Upper Day A focusing on Chest, Back, Side Delts and Triceps.', 60, 'Chest, Back, Shoulders, Arms'),
('e2e00002-0000-4000-8000-000000000002', NULL, 'Lower A', 'Hypertrophy rotation Lower Day A focusing on Quads, Hamstrings, Glutes, and Calves.', 50, 'Legs'),
('e2e00002-0000-4000-8000-000000000003', NULL, 'Upper B', 'Hypertrophy rotation Upper Day B focusing on Shoulders, Arms, and Forearms.', 65, 'Shoulders, Arms, Forearms'),
('e2e00002-0000-4000-8000-000000000004', NULL, 'Lower B', 'Hypertrophy rotation Lower Day B focusing on Hamstrings, Quads, and Calves.', 50, 'Legs'),
('e2e00002-0000-4000-8000-000000000005', NULL, 'Upper C', 'Hypertrophy rotation Upper Day C focusing on Chest, Back, Arms, and traps.', 60, 'Chest, Back, Arms'),
('e2e00002-0000-4000-8000-000000000006', NULL, 'Cardio + Abs', 'Aerobic walking and direct core conditioning routine.', 45, 'Core, Cardio');

-- Seed exercises into templates (using name resolution for safety)
-- Upper A
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000001', id, 1, 1, 4, '10-12', 0, 4 FROM public.exercises WHERE name = 'Chest Bar Flat Press' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000001', id, 2, 2, 4, '10-12', 0, 4 FROM public.exercises WHERE name = 'T-Bar Row' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000001', id, 3, 3, 4, '10-12', 0, 4 FROM public.exercises WHERE name = 'Butterfly' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000001', id, 4, 4, 5, '10-12', 0, 5 FROM public.exercises WHERE name = 'Lat Pulldown' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000001', id, 5, 5, 5, '10-12', 0, 5 FROM public.exercises WHERE name = 'Incline Machine Press' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000001', id, 6, 6, 3, '10-12', 0, 3 FROM public.exercises WHERE name = 'Lateral Raise' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000001', id, 7, 7, 4, '10-12', 0, 4 FROM public.exercises WHERE name = 'Face Away Cable Raise' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000001', id, 8, 8, 4, '10-12', 0, 4 FROM public.exercises WHERE name = 'V-Bar Pushdown' LIMIT 1;

-- Lower A
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000002', id, 1, 1, 5, '10-12', 0, 5 FROM public.exercises WHERE name = 'Leg Press' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000002', id, 2, 2, 5, '10-12', 0, 5 FROM public.exercises WHERE name = 'Seated Leg Curl' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000002', id, 3, 3, 5, '10-12', 0, 5 FROM public.exercises WHERE name = 'Leg Extension' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000002', id, 4, 4, 4, '10-12', 0, 4 FROM public.exercises WHERE name = 'Hip Adduction' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000002', id, 5, 5, 5, '10-12', 0, 5 FROM public.exercises WHERE name = 'Leg Press Calf Raises' LIMIT 1;

-- Upper B
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000003', id, 1, 1, 4, '10-12', 0, 4 FROM public.exercises WHERE name = 'Shoulder Press' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000003', id, 2, 2, 3, '10-12', 0, 3 FROM public.exercises WHERE name = 'Lateral Raise' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000003', id, 3, 3, 3, '10-12', 0, 3 FROM public.exercises WHERE name = 'SA Rear Delt Fly' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000003', id, 4, 4, 4, '10-12', 0, 4 FROM public.exercises WHERE name = 'Face Away Cable Raise' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000003', id, 5, 5, 4, '10-12', 0, 4 FROM public.exercises WHERE name = 'Overhead Extension' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000003', id, 6, 6, 4, '10-12', 0, 4 FROM public.exercises WHERE name = 'V-Bar Pushdown' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000003', id, 7, 7, 2, '10-12', 0, 2 FROM public.exercises WHERE name = 'Face Away Curl' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000003', id, 8, 8, 2, '10-12', 0, 2 FROM public.exercises WHERE name = 'Reverse Grip Curl' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000003', id, 9, 9, 2, '10-12', 0, 2 FROM public.exercises WHERE name = 'Wrist Curl' LIMIT 1;

-- Lower B
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000004', id, 1, 1, 5, '8-12', 0, 5 FROM public.exercises WHERE name = 'SLDL' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000004', id, 2, 2, 5, '10-12', 0, 5 FROM public.exercises WHERE name = 'Seated Leg Curl' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000004', id, 3, 3, 5, '10-12', 0, 5 FROM public.exercises WHERE name = 'Leg Extension' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000004', id, 4, 4, 4, '10-12', 0, 4 FROM public.exercises WHERE name = 'Hip Adduction' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000004', id, 5, 5, 5, '10-12', 0, 5 FROM public.exercises WHERE name = 'Leg Press Calf Raises' LIMIT 1;

-- Upper C
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000005', id, 1, 1, 4, '10-12', 0, 4 FROM public.exercises WHERE name = 'Chest Bar Flat Press' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000005', id, 2, 2, 4, '10-12', 0, 4 FROM public.exercises WHERE name = 'T-Bar Row' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000005', id, 3, 3, 4, '10-12', 0, 4 FROM public.exercises WHERE name = 'Butterfly' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000005', id, 4, 4, 5, '10-12', 0, 5 FROM public.exercises WHERE name = 'Single Lat Row' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000005', id, 5, 5, 5, '10-12', 0, 5 FROM public.exercises WHERE name = 'Incline Machine Press' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000005', id, 6, 6, 4, '10-12', 0, 4 FROM public.exercises WHERE name = 'Machine Pullover' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000005', id, 7, 7, 4, '10-12', 0, 4 FROM public.exercises WHERE name = 'Shrugs' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000005', id, 8, 8, 2, '10-12', 0, 2 FROM public.exercises WHERE name = 'Reverse Grip Curl' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000005', id, 9, 9, 2, '10-12', 0, 2 FROM public.exercises WHERE name = 'Wrist Curl' LIMIT 1;

-- Cardio + Abs
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000006', id, 1, 1, 1, '25-30 Min', 0, 1 FROM public.exercises WHERE name = 'Incline Walking' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000006', id, 2, 2, 4, '12-15', 0, 4 FROM public.exercises WHERE name = 'Cable Crunch' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000006', id, 3, 3, 3, '10-15', 0, 3 FROM public.exercises WHERE name = 'Hanging Leg Raise' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000006', id, 4, 4, 3, '8-12', 0, 3 FROM public.exercises WHERE name = 'Ab Wheel Rollout' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000006', id, 5, 5, 3, '45-60 Sec', 0, 3 FROM public.exercises WHERE name = 'Plank' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000006', id, 6, 6, 3, '10-12', 0, 3 FROM public.exercises WHERE name = 'Pallof Press' LIMIT 1;
INSERT INTO public.workout_template_exercises (template_id, exercise_id, exercise_order, sequence_number, target_sets, target_reps, warmup_sets, working_sets)
SELECT 'e2e00002-0000-4000-8000-000000000006', id, 7, 7, 3, 'Rounds', 0, 3 FROM public.exercises WHERE name = 'Farmer Walk' LIMIT 1;
