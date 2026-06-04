-- ============================================================
-- THE TRACKER — Row-Level Security Policies
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Exercises: users see system defaults + their own custom exercises
CREATE POLICY "Users can view exercises"
    ON public.exercises FOR SELECT
    USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create exercises"
    ON public.exercises FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercises"
    ON public.exercises FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercises"
    ON public.exercises FOR DELETE
    USING (auth.uid() = user_id);

-- Workouts: full CRUD on own workouts
CREATE POLICY "Users manage own workouts"
    ON public.workouts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Workout Entries: access via parent workout ownership
CREATE POLICY "Users manage own workout entries"
    ON public.workout_entries FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workouts
            WHERE workouts.id = workout_entries.workout_id
            AND workouts.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workouts
            WHERE workouts.id = workout_entries.workout_id
            AND workouts.user_id = auth.uid()
        )
    );

-- Weight Logs: full CRUD on own logs
CREATE POLICY "Users manage own weight logs"
    ON public.weight_logs FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Personal Records: full CRUD on own records
CREATE POLICY "Users manage own records"
    ON public.personal_records FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
