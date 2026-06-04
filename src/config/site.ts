export const siteConfig = {
  name: "THE TRACKER",
  tagline: "Track. Improve. Repeat.",
  description:
    "A lightweight personal fitness tracking platform to log workouts, track body weight, and monitor personal records.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const;

export const muscleGroups = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Cardio",
] as const;

export type MuscleGroup = (typeof muscleGroups)[number];

export const weightUnits = ["kg", "lbs"] as const;
export type WeightUnit = (typeof weightUnits)[number];

export const defaultRestTimerSeconds = 90;
