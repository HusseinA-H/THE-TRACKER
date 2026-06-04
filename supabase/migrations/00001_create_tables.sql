-- ============================================================
-- THE TRACKER — Database Schema
-- ============================================================

-- 1. Profiles
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Exercises
CREATE TABLE public.exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    primary_muscle_group TEXT NOT NULL,
    secondary_muscle_group TEXT,
    description TEXT,
    video_url TEXT,
    is_custom BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_primary_muscle CHECK (
        primary_muscle_group IN ('Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio')
    )
);

-- 3. Workouts
CREATE TABLE public.workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT DEFAULT 'Workout' NOT NULL,
    notes TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

-- 4. Workout Entries (sets per exercise per workout)
CREATE TABLE public.workout_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE RESTRICT NOT NULL,
    set_number INTEGER NOT NULL,
    weight NUMERIC(6, 2) NOT NULL DEFAULT 0,
    reps INTEGER NOT NULL DEFAULT 0,
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    is_pr BOOLEAN DEFAULT FALSE NOT NULL,
    estimated_1rm NUMERIC(6, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Weight Logs
CREATE TABLE public.weight_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    weight NUMERIC(5, 2) NOT NULL,
    log_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, log_date)
);

-- 6. Personal Records
CREATE TABLE public.personal_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    max_weight NUMERIC(6, 2) NOT NULL DEFAULT 0,
    max_estimated_1rm NUMERIC(6, 2) NOT NULL DEFAULT 0,
    set_id UUID REFERENCES public.workout_entries(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, exercise_id)
);
