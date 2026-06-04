-- ============================================================
-- THE TRACKER — Performance Indexes
-- ============================================================

CREATE INDEX idx_workouts_user_completed ON public.workouts(user_id, completed_at DESC);
CREATE INDEX idx_workouts_user_active ON public.workouts(user_id) WHERE completed_at IS NULL;
CREATE INDEX idx_workout_entries_workout ON public.workout_entries(workout_id);
CREATE INDEX idx_workout_entries_exercise ON public.workout_entries(exercise_id);
CREATE INDEX idx_weight_logs_user_date ON public.weight_logs(user_id, log_date DESC);
CREATE INDEX idx_exercises_muscle ON public.exercises(primary_muscle_group);
CREATE INDEX idx_exercises_user ON public.exercises(user_id);
CREATE INDEX idx_personal_records_user ON public.personal_records(user_id);
