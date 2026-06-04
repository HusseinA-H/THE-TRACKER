"use server";

import { revalidatePath } from "next/cache";
import {
  changeUserRole,
  createSystemExercise,
  updateSystemExercise,
  deleteSystemExercise,
} from "./services/admin-service";
import { roleChangeSchema } from "./schemas";
import { exerciseFormSchema, type ExerciseFormValues } from "@/features/exercises/schemas";
import type { ActionResult } from "@/lib/utils";
import type { Exercise } from "@/types";

export async function changeUserRoleAction(
  userId: string,
  newRole: "super_admin" | "admin" | "user"
): Promise<ActionResult<void>> {
  try {
    const validated = roleChangeSchema.parse({ userId, role: newRole });
    await changeUserRole(validated.userId, validated.role);
    
    revalidatePath("/administration/users");
    revalidatePath(`/administration/users/${userId}`);
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Action error changing role:", error);
    return {
      success: false,
      error: error.message || "Could not update user role.",
    };
  }
}

export async function createSystemExerciseAction(
  input: ExerciseFormValues
): Promise<ActionResult<Exercise>> {
  try {
    const validated = exerciseFormSchema.parse(input);
    const result = await createSystemExercise(validated);

    revalidatePath("/administration/exercises");
    revalidatePath("/dashboard/exercises"); // Users see new system exercises
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error creating system exercise:", error);
    return {
      success: false,
      error: error.message || "Could not create system exercise.",
    };
  }
}

export async function updateSystemExerciseAction(
  id: string,
  input: ExerciseFormValues
): Promise<ActionResult<Exercise>> {
  try {
    const validated = exerciseFormSchema.parse(input);
    const result = await updateSystemExercise(id, validated);

    revalidatePath("/administration/exercises");
    revalidatePath("/dashboard/exercises");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error updating system exercise:", error);
    return {
      success: false,
      error: error.message || "Could not update system exercise.",
    };
  }
}

export async function deleteSystemExerciseAction(
  id: string
): Promise<ActionResult<void>> {
  try {
    await deleteSystemExercise(id);
    revalidatePath("/administration/exercises");
    revalidatePath("/dashboard/exercises");
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Action error deleting system exercise:", error);
    return {
      success: false,
      error:
        error.message ||
        "Could not delete system exercise. It might be referenced by user logs.",
    };
  }
}

const defaultSystemExercises = [
  { name: "Chest Bar Flat Press", primaryMuscleGroup: "Chest", secondaryMuscleGroup: "Shoulders", description: "A flat press variation using a machine or barbell to target the pectorals.", videoUrl: null, category: "Chest", equipment: "Machine", difficulty: "Beginner", alternativeExercise: "Bench Press (Barbell)", notes: "Keep elbows slightly tucked. Press smoothly." },
  { name: "T-Bar Row", primaryMuscleGroup: "Back", secondaryMuscleGroup: "Arms", description: "A rowing exercise performed with a T-bar setup to build back thickness.", videoUrl: null, category: "Back", equipment: "Barbell", difficulty: "Intermediate", alternativeExercise: "Bent Over Row", notes: "Pull to lower chest, squeeze shoulder blades." },
  { name: "Butterfly", primaryMuscleGroup: "Chest", secondaryMuscleGroup: "Shoulders", description: "An isolation chest fly exercise targeting the pectoralis major.", videoUrl: null, category: "Chest", equipment: "Machine", difficulty: "Beginner", alternativeExercise: "Dumbbell Fly", notes: "Focus on the squeeze at the peak contraction." },
  { name: "Lat Pulldown", primaryMuscleGroup: "Back", secondaryMuscleGroup: "Arms", description: "A vertical pull down exercise focusing on the latissimus dorsi.", videoUrl: null, category: "Back", equipment: "Cable", difficulty: "Beginner", alternativeExercise: "Pull-Up", notes: "Pull to upper chest, keep torso upright." },
  { name: "Incline Machine Press", primaryMuscleGroup: "Chest", secondaryMuscleGroup: "Shoulders", description: "An inclined machine chest press targeting the upper pectorals.", videoUrl: null, category: "Chest", equipment: "Machine", difficulty: "Beginner", alternativeExercise: "Incline Dumbbell Press", notes: "Targets the upper chest fibers." },
  { name: "Lateral Raise", primaryMuscleGroup: "Shoulders", secondaryMuscleGroup: "Arms", description: "An isolation exercise targeting the lateral deltoids for shoulder width.", videoUrl: null, category: "Shoulders", equipment: "Dumbbell", difficulty: "Beginner", alternativeExercise: "Cable Lateral Raise", notes: "Lead with the elbows, raise to parallel." },
  { name: "Face Away Cable Raise", primaryMuscleGroup: "Shoulders", secondaryMuscleGroup: "Arms", description: "A cable lateral raise performed facing away from the pulley for constant tension.", videoUrl: null, category: "Shoulders", equipment: "Cable", difficulty: "Intermediate", alternativeExercise: "Lateral Raise", notes: "Maintains continuous tension on lateral delt." },
  { name: "V-Bar Pushdown", primaryMuscleGroup: "Arms", secondaryMuscleGroup: "Shoulders", description: "A cable triceps pushdown variation using a V-bar attachment.", videoUrl: null, category: "Triceps", equipment: "Cable", difficulty: "Beginner", alternativeExercise: "Rope Pushdown", notes: "Keep elbows locked at sides." },
  { name: "Leg Press", primaryMuscleGroup: "Legs", secondaryMuscleGroup: "Core", description: "A compound leg press exercise targeting the quadriceps and glutes.", videoUrl: null, category: "Quads", equipment: "Machine", difficulty: "Beginner", alternativeExercise: "Squat (Barbell)", notes: "Do not lock out knees at the top." },
  { name: "Seated Leg Curl", primaryMuscleGroup: "Legs", secondaryMuscleGroup: "Core", description: "An isolation exercise to strengthen the hamstrings in a seated position.", videoUrl: null, category: "Hamstrings", equipment: "Machine", difficulty: "Beginner", alternativeExercise: "Lying Leg Curl", notes: "Squeeze hamstrings at bottom, control return." },
  { name: "Leg Extension", primaryMuscleGroup: "Legs", secondaryMuscleGroup: "Core", description: "An isolation machine exercise targeting the quadriceps.", videoUrl: null, category: "Quads", equipment: "Machine", difficulty: "Beginner", alternativeExercise: "Goblet Squat", notes: "Hold peak contraction for 1 second." },
  { name: "Hip Adduction", primaryMuscleGroup: "Legs", secondaryMuscleGroup: "Core", description: "An isolation movement targeting the inner thigh adductor muscles.", videoUrl: null, category: "Glutes", equipment: "Machine", difficulty: "Beginner", alternativeExercise: "Cossack Squat", notes: "Builds adductor and hip stability." },
  { name: "Leg Press Calf Raises", primaryMuscleGroup: "Legs", secondaryMuscleGroup: "Core", description: "Calf raises performed on a leg press machine to isolate the calves.", videoUrl: null, category: "Calves", equipment: "Machine", difficulty: "Beginner", alternativeExercise: "Standing Calf Raise", notes: "Pause at full stretch and full contraction." },
  { name: "Shoulder Press", primaryMuscleGroup: "Shoulders", secondaryMuscleGroup: "Arms", description: "An overhead press variation targeting the anterior deltoids.", videoUrl: null, category: "Shoulders", equipment: "Dumbbell", difficulty: "Beginner", alternativeExercise: "Overhead Press", notes: "Press straight up, control the eccentric." },
  { name: "SA Rear Delt Fly", primaryMuscleGroup: "Shoulders", secondaryMuscleGroup: "Back", description: "A single-arm rear delt fly targeting the posterior deltoids.", videoUrl: null, category: "Shoulders", equipment: "Cable", difficulty: "Intermediate", alternativeExercise: "Rear Delt Fly (Dumbbell)", notes: "Isolates posterior deltoid with cable tension." },
  { name: "Overhead Extension", primaryMuscleGroup: "Arms", secondaryMuscleGroup: "Shoulders", description: "A triceps extension targeting the long head in an overhead position.", videoUrl: null, category: "Triceps", equipment: "Dumbbell", difficulty: "Intermediate", alternativeExercise: "Lying Triceps Extension", notes: "Emphasizes the long head stretch." },
  { name: "Face Away Curl", primaryMuscleGroup: "Arms", secondaryMuscleGroup: "Shoulders", description: "A bicep curl variation performed facing away from a cable pulley.", videoUrl: null, category: "Biceps", equipment: "Cable", difficulty: "Intermediate", alternativeExercise: "Bicep Curl (Dumbbell)", notes: "Keep elbow behind torso for shoulder extension stretch." },
  { name: "Reverse Grip Curl", primaryMuscleGroup: "Arms", secondaryMuscleGroup: "Shoulders", description: "A curl variation using an overhand grip to target the brachioradialis and forearms.", videoUrl: null, category: "Forearms", equipment: "Barbell", difficulty: "Beginner", alternativeExercise: "Hammer Curl", notes: "Pronated grip targets brachioradialis." },
  { name: "Wrist Curl", primaryMuscleGroup: "Arms", secondaryMuscleGroup: "Shoulders", description: "An isolation exercise to strengthen the wrist flexor and forearm muscles.", videoUrl: null, category: "Forearms", equipment: "Dumbbell", difficulty: "Beginner", alternativeExercise: "Reverse Wrist Curl", notes: "Isolates forearm flexors." },
  { name: "SLDL", primaryMuscleGroup: "Legs", secondaryMuscleGroup: "Back", description: "Stiff-Legged Deadlift targeting the hamstrings and lower back.", videoUrl: null, category: "Hamstrings", equipment: "Barbell", difficulty: "Intermediate", alternativeExercise: "Deadlift (Barbell)", notes: "Hinge at hips, keep back flat." },
  { name: "Single Lat Row", primaryMuscleGroup: "Back", secondaryMuscleGroup: "Arms", description: "A unilateral row exercise to isolate and build the latissimus dorsi.", videoUrl: null, category: "Back", equipment: "Dumbbell", difficulty: "Intermediate", alternativeExercise: "One-Arm Dumbbell Row", notes: "Pull dumbbell to hip, keeping elbow close." },
  { name: "Machine Pullover", primaryMuscleGroup: "Back", secondaryMuscleGroup: "Arms", description: "A pullover movement targeting the latissimus dorsi through a full range of motion.", videoUrl: null, category: "Back", equipment: "Machine", difficulty: "Intermediate", alternativeExercise: "Dumbbell Pullover", notes: "Squeeze lats at bottom of movement." },
  { name: "Shrugs", primaryMuscleGroup: "Shoulders", secondaryMuscleGroup: "Back", description: "An exercise focusing on the upper trapezius muscles.", videoUrl: null, category: "Shoulders", equipment: "Dumbbell", difficulty: "Beginner", alternativeExercise: "Barbell Shrugs", notes: "Shrug straight up, do not roll shoulders." },
  { name: "Incline Walking", primaryMuscleGroup: "Cardio", secondaryMuscleGroup: "Legs", description: "Aerobic training performed by walking on an inclined treadmill.", videoUrl: null, category: "Cardio", equipment: "Treadmill", difficulty: "Beginner", alternativeExercise: "Cycling", notes: "Cardiovascular conditioning." },
  { name: "Cable Crunch", primaryMuscleGroup: "Core", secondaryMuscleGroup: "Back", description: "A cable-loaded abdominal crunch targeting the rectus abdominis.", videoUrl: null, category: "Abs", equipment: "Cable", difficulty: "Beginner", alternativeExercise: "Crunch", notes: "Flex spine, do not pull with hips." },
  { name: "Hanging Leg Raise", primaryMuscleGroup: "Core", secondaryMuscleGroup: "Legs", description: "A core stability movement targeting the lower abdominals and hip flexors.", videoUrl: null, category: "Abs", equipment: "Bodyweight", difficulty: "Intermediate", alternativeExercise: "Lying Leg Raise", notes: "Raise legs to parallel, avoid swinging." },
  { name: "Ab Wheel Rollout", primaryMuscleGroup: "Core", secondaryMuscleGroup: "Back", description: "An rollout exercise targeting abdominal anti-extension strength.", videoUrl: null, category: "Abs", equipment: "Bodyweight", difficulty: "Advanced", alternativeExercise: "Plank", notes: "Brace core, do not sag lower back." },
  { name: "Plank", primaryMuscleGroup: "Core", secondaryMuscleGroup: "Legs", description: "An isometric hold exercise targeting core endurance and stability.", videoUrl: null, category: "Core", equipment: "Bodyweight", difficulty: "Beginner", alternativeExercise: "Side Plank", notes: "Hold straight line from head to heels." },
  { name: "Pallof Press", primaryMuscleGroup: "Core", secondaryMuscleGroup: "Shoulders", description: "An anti-rotation core exercise performed with a cable or band.", videoUrl: null, category: "Core", equipment: "Cable", difficulty: "Intermediate", alternativeExercise: "Rotational Plank", notes: "Resist rotation as you press cable forward." },
  { name: "Farmer Walk", primaryMuscleGroup: "Core", secondaryMuscleGroup: "Arms", description: "A loaded carry movement building grip strength and core stability.", videoUrl: null, category: "Core", equipment: "Dumbbell", difficulty: "Beginner", alternativeExercise: "Suitcase Carry", notes: "Walk with upright posture and brace core." }
];

export async function seedSystemExercisesAction(): Promise<ActionResult<number>> {
  try {
    let seededCount = 0;
    for (const ex of defaultSystemExercises) {
      try {
        await createSystemExercise(ex);
        seededCount++;
      } catch (err) {
        // Skip duplicates or errors
        console.warn(`Skipped seeding: ${ex.name}`);
      }
    }
    revalidatePath("/administration/exercises");
    revalidatePath("/dashboard/exercises");
    return { success: true, data: seededCount };
  } catch (error: any) {
    console.error("Action error seeding default exercises:", error);
    return {
      success: false,
      error: error.message || "Failed to seed default exercises.",
    };
  }
}
