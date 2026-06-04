// ── Clean Domain Types ────────────────────────────────────────
// camelCase types used throughout the application.
// Mapped from database row types in feature modules.

import type { MuscleGroup } from "@/config/site";
export type { MuscleGroup };

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role?: "super_admin" | "admin" | "user";
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  userId: string | null;
  name: string;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroup: MuscleGroup | null;
  description: string | null;
  videoUrl: string | null;
  isCustom: boolean;
  category: string | null;
  equipment: string | null;
  difficulty: string | null;
  alternativeExercise: string | null;
  notes: string | null;
  createdAt: string;
}

export interface WorkoutTemplate {
  id: string;
  userId: string | null;
  name: string;
  description: string | null;
  estimatedDuration: number;
  muscleFocus: string;
  createdAt: string;
  updatedAt: string;
  templateExercises?: WorkoutTemplateExercise[];
}

export interface WorkoutTemplateExercise {
  id: string;
  templateId: string;
  exerciseId: string;
  sequenceNumber: number;
  targetSets: number;
  targetReps: string;
  warmupSets: number;
  workingSets: number;
  createdAt: string;
  exercise?: Exercise;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  notes: string | null;
  startedAt: string;
  completedAt: string | null;
  templateId: string | null;
  entries?: WorkoutEntry[];
}

export interface WorkoutEntry {
  id: string;
  workoutId: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  isCompleted: boolean;
  isPr: boolean;
  estimated1rm: number | null;
  notes: string | null;
  createdAt: string;
  setType: "warmup" | "working" | "top" | "failure";
  exercise?: Exercise;
  workoutCompletedAt?: string;
  workoutName?: string;
}

export interface WeightLog {
  id: string;
  userId: string;
  weight: number;
  logDate: string;
  createdAt: string;
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  maxWeight: number;
  maxEstimated1rm: number;
  maxVolume: number;
  setId: string | null;
  volumeSetId: string | null;
  updatedAt: string;
  exercise?: Exercise;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  logDate: string;
  weight: number | null;
  waist: number | null;
  chest: number | null;
  shoulders: number | null;
  arms: number | null;
  forearms: number | null;
  thighs: number | null;
  calves: number | null;
  createdAt: string;
}

export interface ProgressPhoto {
  id: string;
  userId: string;
  photoUrl: string;
  category: "front" | "side" | "back";
  logDate: string;
  createdAt: string;
}

export interface UserScheduleSettings {
  userId: string;
  cycleStartDate: string;
  createdAt: string;
}

export interface ExerciseAlternative {
  id: string;
  exerciseId: string;
  alternativeId: string;
  preferenceOrder: number;
  createdAt: string;
  alternative?: Exercise;
}

export interface PersonalRecordHistory {
  id: string;
  userId: string;
  exerciseId: string;
  workoutEntryId: string;
  prType: "weight" | "volume" | "estimated_1rm";
  value: number;
  achievedAt: string;
  exercise?: Exercise;
}

export interface DashboardStats {
  currentWeight: number | null;
  weightDifference: number | null;
  lastWorkoutDate: string | null;
  totalWorkouts: number;
  totalPRs: number;
  weeklyActivity: boolean[];
}

export interface WorkoutPackage {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  templates?: WorkoutTemplate[];
}

export interface WorkoutPackageTemplate {
  id: string;
  packageId: string;
  templateId: string;
  createdAt: string;
}
