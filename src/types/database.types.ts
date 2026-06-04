// ── Database Row Types ────────────────────────────────────────
// These mirror the PostgreSQL schema exactly (snake_case).
// Replace with auto-generated types: npx supabase gen types typescript

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, "created_at" | "updated_at">;
        Update: Partial<Omit<ProfileRow, "id">>;
      };
      exercises: {
        Row: ExerciseRow;
        Insert: Omit<ExerciseRow, "id" | "created_at">;
        Update: Partial<Omit<ExerciseRow, "id" | "created_at">>;
      };
      workouts: {
        Row: WorkoutRow;
        Insert: Omit<WorkoutRow, "id" | "started_at">;
        Update: Partial<Omit<WorkoutRow, "id">>;
      };
      workout_entries: {
        Row: WorkoutEntryRow;
        Insert: Omit<WorkoutEntryRow, "id" | "created_at">;
        Update: Partial<Omit<WorkoutEntryRow, "id" | "created_at">>;
      };
      weight_logs: {
        Row: WeightLogRow;
        Insert: Omit<WeightLogRow, "id" | "created_at">;
        Update: Partial<Omit<WeightLogRow, "id" | "created_at">>;
      };
      personal_records: {
        Row: PersonalRecordRow;
        Insert: Omit<PersonalRecordRow, "id" | "updated_at">;
        Update: Partial<Omit<PersonalRecordRow, "id">>;
      };
      workout_templates: {
        Row: WorkoutTemplateRow;
        Insert: Omit<WorkoutTemplateRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<WorkoutTemplateRow, "id">>;
      };
      workout_template_exercises: {
        Row: WorkoutTemplateExerciseRow;
        Insert: Omit<WorkoutTemplateExerciseRow, "id" | "created_at">;
        Update: Partial<Omit<WorkoutTemplateExerciseRow, "id">>;
      };
      workout_packages: {
        Row: WorkoutPackageRow;
        Insert: Omit<WorkoutPackageRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<WorkoutPackageRow, "id">>;
      };
      workout_package_templates: {
        Row: WorkoutPackageTemplateRow;
        Insert: Omit<WorkoutPackageTemplateRow, "id" | "created_at">;
        Update: Partial<Omit<WorkoutPackageTemplateRow, "id">>;
      };
    };
  };
}

// ── Row Types (exact DB columns) ──────────────────────────────

export interface ProfileRow {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: "super_admin" | "admin" | "user";
  created_at: string;
  updated_at: string;
}

export interface ExerciseRow {
  id: string;
  user_id: string | null;
  name: string;
  primary_muscle_group: string;
  secondary_muscle_group: string | null;
  description: string | null;
  video_url: string | null;
  is_custom: boolean;
  category: string | null;
  equipment: string | null;
  difficulty: string | null;
  alternative_exercise: string | null;
  notes: string | null;
  created_at: string;
}

export interface WorkoutRow {
  id: string;
  user_id: string;
  name: string;
  notes: string | null;
  started_at: string;
  completed_at: string | null;
  template_id: string | null;
}

export interface WorkoutEntryRow {
  id: string;
  workout_id: string;
  exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
  is_completed: boolean;
  is_pr: boolean;
  estimated_1rm: number | null;
  notes: string | null;
  created_at: string;
  set_type: "warmup" | "working" | "top" | "failure";
}

export interface WeightLogRow {
  id: string;
  user_id: string;
  weight: number;
  log_date: string;
  created_at: string;
}

export interface PersonalRecordRow {
  id: string;
  user_id: string;
  exercise_id: string;
  max_weight: number;
  max_estimated_1rm: number;
  set_id: string | null;
  updated_at: string;
}

export interface WorkoutTemplateRow {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  estimated_duration: number;
  muscle_focus: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutTemplateExerciseRow {
  id: string;
  template_id: string;
  exercise_id: string;
  sequence_number: number;
  target_sets: number;
  target_reps: string;
  warmup_sets: number;
  working_sets: number;
  created_at: string;
}

export interface WorkoutPackageRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutPackageTemplateRow {
  id: string;
  package_id: string;
  template_id: string;
  created_at: string;
}

