# API Specification

This document details the interface endpoints, Next.js Server Actions, and direct Supabase client SDK operations used to manage data in **THE TRACKER**.

---

## 1. Supabase Client SDK Initialization

We instantiate two clients depending on whether the execution takes place on the client (browser) or server (Server Component/Server Action).

### Browser-side Client (`lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

### Server-side Client (`lib/supabase/server.ts`)
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const createClient = () => {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};
```

---

## 2. Next.js Server Actions (`app/actions/workouts.ts`)

Server Actions are used for state mutation and database writes, ensuring type safety and server-side execution.

### A. Start Workout Session
* **Function**: `startWorkoutSession(name: string): Promise<{ success: boolean; data?: any; error?: string }>`
* **Description**: Creates a new row in the `workouts` table with `completed_at` set to `NULL`.
* **Payload**:
  ```typescript
  {
    name: "Leg Day - Focus Quads"
  }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "e2bfa802-fa54-47bd-b2a8-f716612d3851",
      "user_id": "8c66e2c3-42bf-4636-be8a-d2d46e01a61c",
      "name": "Leg Day - Focus Quads",
      "started_at": "2026-06-03T18:45:00Z",
      "completed_at": null
    }
  }
  ```

### B. Add Exercise to Workout
* **Function**: `addExerciseToWorkout(workoutId: string, exerciseId: string, order: number)`
* **Description**: Inserts a new junction record in `workout_exercises`.

### C. Update / Log Workout Set
* **Function**: `updateWorkoutSet(setId: string, weight: number, reps: number, rpe: number, isCompleted: boolean)`
* **Description**: Updates weights/reps, checks for PRs, and marks the set completed.
* **Payload**:
  ```typescript
  {
    "setId": "f0a82bcf-f96b-4bb2-b6ab-d2459b7ce967",
    "weight": 140.0,
    "reps": 5,
    "rpe": 9,
    "isCompleted": true
  }
  ```

### D. Complete Workout Session
* **Function**: `completeWorkoutSession(workoutId: string, notes?: string)`
* **Description**: Updates the `workouts` row setting `completed_at` to `NOW()`. Clears local cache.

---

## 3. Weight Tracking Server Actions (`app/actions/weight.ts`)

### Log Body Weight
* **Function**: `logBodyWeight(weight: number, dateStr: string)`
* **Description**: Upserts the body weight for the specified user and date.
* **Implementation snippet**:
  ```typescript
  export async function logBodyWeight(weight: number, dateStr: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from('weight_logs')
      .upsert({
        user_id: user.id,
        weight,
        log_date: dateStr
      }, { onConflict: 'user_id,log_date' })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard');
    return { success: true, data };
  }
  ```

---

## 4. REST API Endpoints (Data Export & Integration)

For programmatic backups and developer utility, the app exposes standard REST endpoints.

### GET `/api/data/export`
* **Access**: Authenticated users (via Bearer JWT token header).
* **Response**: A complete archive of all user data.
* **JSON Output**:
  ```json
  {
    "profile": {
      "id": "8c66e2c3-42bf-4636-be8a-d2d46e01a61c",
      "email": "user@gmail.com",
      "display_name": "Alex Lifter"
    },
    "weight_logs": [
      { "log_date": "2026-06-01", "weight": 82.4 },
      { "log_date": "2026-06-02", "weight": 82.2 }
    ],
    "workouts": [
      {
        "id": "e2bfa802-fa54-47bd-b2a8-f716612d3851",
        "name": "Push Day",
        "started_at": "2026-06-01T10:00:00Z",
        "completed_at": "2026-06-01T11:15:00Z",
        "exercises": [
          {
            "name": "Bench Press",
            "sets": [
              { "set_number": 1, "weight": 80.0, "reps": 8, "rpe": 8, "is_pr": true }
            ]
          }
        ]
      }
    ]
  }
  ```
