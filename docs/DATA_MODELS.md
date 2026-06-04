# Data Models

This document defines the core TypeScript interfaces and type definitions used throughout **THE TRACKER** on both the client and server.

---

## 1. Domain Entities (TypeScript Interfaces)

These types represent structured data models mapping clean models to the user interface.

### A. Profile
```typescript
export interface Profile {
  id: string; // References auth.users ID
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string; // ISO DateTime
  updatedAt: string;
}
```

### B. Exercise
```typescript
export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio';

export interface Exercise {
  id: string;
  userId: string | null; // null represents default system exercise
  name: string;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroup: MuscleGroup | null;
  description: string | null;
  isCustom: boolean;
  createdAt: string;
}
```

### C. Workout Session
```typescript
export interface Workout {
  id: string;
  userId: string;
  name: string;
  notes: string | null;
  startedAt: string;
  completedAt: string | null; // null indicates the workout is currently active
  exercises?: WorkoutExercise[]; // Populated on join queries
}
```

### D. Workout Exercise (Junction)
```typescript
export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  exercise: Exercise; // Embedded exercise details
  sequenceOrder: number;
  sets: WorkoutSet[]; // Nested list of logged sets
}
```

### E. Workout Set
```typescript
export interface WorkoutSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  weight: number; // Stored as numeric, parsed as float
  reps: number;
  rpe: number | null; // 1 to 10
  isCompleted: boolean;
  isPr: boolean;
  estimated1rm: number | null;
  createdAt: string;
}
```

### F. Weight Log
```typescript
export interface WeightLog {
  id: string;
  userId: string;
  weight: number;
  logDate: string; // YYYY-MM-DD
  createdAt: string;
}
```

### G. Personal Record
```typescript
export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  maxWeight: number;
  maxEstimated1rm: number;
  setId: string | null;
  updatedAt: string;
}
```

---

## 2. Supabase Generated Types Helper

The application integrates with `@supabase/supabase-js`, which takes a generic Database schema interface representing the actual raw table names:

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          user_id: string | null
          name: string
          primary_muscle_group: string
          secondary_muscle_group: string | null
          description: string | null
          is_custom: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          primary_muscle_group: string
          secondary_muscle_group?: string | null
          description?: string | null
          is_custom?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          primary_muscle_group?: string
          secondary_muscle_group?: string | null
          description?: string | null
          is_custom?: boolean
          created_at?: string
        }
      }
      // Similar structures apply to: workouts, workout_exercises, workout_sets, weight_logs, and personal_records
    }
  }
}
```
