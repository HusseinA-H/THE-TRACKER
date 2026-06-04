-- ============================================================
-- THE TRACKER — Athlete Upgrade System Schema
-- Migration: 00010_athlete_upgrade_system.sql
-- ============================================================

-- 1. Create Exercise Alternatives Table
CREATE TABLE IF NOT EXISTS public.exercise_alternatives (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    alternative_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    preference_order INTEGER NOT NULL CHECK (preference_order BETWEEN 1 AND 3),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_exercise_alternative UNIQUE (exercise_id, alternative_id),
    CONSTRAINT unique_exercise_preference UNIQUE (exercise_id, preference_order),
    CONSTRAINT no_self_reference CHECK (exercise_id <> alternative_id)
);

-- 2. Extend Existing Personal Records Table
ALTER TABLE public.personal_records ADD COLUMN IF NOT EXISTS max_volume NUMERIC(8, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.personal_records ADD COLUMN IF NOT EXISTS volume_set_id UUID REFERENCES public.workout_entries(id) ON DELETE SET NULL;

-- 3. Create Personal Records History Table
CREATE TABLE IF NOT EXISTS public.personal_records_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    workout_entry_id UUID REFERENCES public.workout_entries(id) ON DELETE CASCADE NOT NULL,
    pr_type TEXT NOT NULL CHECK (pr_type IN ('weight', 'volume', 'estimated_1rm')),
    value NUMERIC(8, 2) NOT NULL,
    achieved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Create Body Measurements Table
CREATE TABLE IF NOT EXISTS public.body_measurements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    log_date DATE DEFAULT CURRENT_DATE NOT NULL,
    weight NUMERIC(5, 2),
    waist NUMERIC(5, 2),
    chest NUMERIC(5, 2),
    shoulders NUMERIC(5, 2),
    arms NUMERIC(5, 2),
    forearms NUMERIC(5, 2),
    thighs NUMERIC(5, 2),
    calves NUMERIC(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_measurement_date UNIQUE (user_id, log_date)
);

-- 5. Create Progress Photos Table
CREATE TABLE IF NOT EXISTS public.progress_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    photo_url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('front', 'side', 'back')),
    log_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Create User Schedule Settings Table
CREATE TABLE IF NOT EXISTS public.user_schedule_settings (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    cycle_start_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Create Sync Triggers for Weight Logs & Body Measurements
CREATE OR REPLACE FUNCTION public.sync_weight_to_measurements()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.body_measurements (user_id, log_date, weight)
    VALUES (NEW.user_id, NEW.log_date, NEW.weight)
    ON CONFLICT (user_id, log_date) 
    DO UPDATE SET weight = EXCLUDED.weight;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_weight_to_measurements ON public.weight_logs;
CREATE TRIGGER trigger_sync_weight_to_measurements
AFTER INSERT OR UPDATE OF weight ON public.weight_logs
FOR EACH ROW EXECUTE FUNCTION public.sync_weight_to_measurements();

CREATE OR REPLACE FUNCTION public.sync_measurements_to_weight()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.weight IS NOT NULL THEN
        INSERT INTO public.weight_logs (user_id, log_date, weight)
        VALUES (NEW.user_id, NEW.log_date, NEW.weight)
        ON CONFLICT (user_id, log_date) 
        DO UPDATE SET weight = EXCLUDED.weight;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_measurements_to_weight ON public.body_measurements;
CREATE TRIGGER trigger_sync_measurements_to_weight
AFTER INSERT OR UPDATE OF weight ON public.body_measurements
FOR EACH ROW EXECUTE FUNCTION public.sync_measurements_to_weight();

-- 8. Create Indexes
CREATE INDEX IF NOT EXISTS idx_exercise_alternatives_exercise_id ON public.exercise_alternatives(exercise_id);
CREATE INDEX IF NOT EXISTS idx_pr_history_user_exercise ON public.personal_records_history(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date ON public.body_measurements(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_category ON public.progress_photos(user_id, category);

-- 9. Enable Row-Level Security
ALTER TABLE public.exercise_alternatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_schedule_settings ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies

-- Exercise Alternatives
DROP POLICY IF EXISTS "Anyone can view exercise alternatives" ON public.exercise_alternatives;
CREATE POLICY "Anyone can view exercise alternatives" ON public.exercise_alternatives
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage exercise alternatives" ON public.exercise_alternatives;
CREATE POLICY "Admins can manage exercise alternatives" ON public.exercise_alternatives
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

-- Personal Records History
DROP POLICY IF EXISTS "Users can manage own PR history" ON public.personal_records_history;
CREATE POLICY "Users can manage own PR history" ON public.personal_records_history
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Body Measurements
DROP POLICY IF EXISTS "Users can manage own body measurements" ON public.body_measurements;
CREATE POLICY "Users can manage own body measurements" ON public.body_measurements
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Progress Photos
DROP POLICY IF EXISTS "Users can manage own progress photos" ON public.progress_photos;
CREATE POLICY "Users can manage own progress photos" ON public.progress_photos
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- User Schedule Settings
DROP POLICY IF EXISTS "Users can manage own schedule settings" ON public.user_schedule_settings;
CREATE POLICY "Users can manage own schedule settings" ON public.user_schedule_settings
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
