import type { MuscleGroup } from "@/config/site";

export function getMuscleGroupColor(group: MuscleGroup): string {
  switch (group) {
    case "Chest":
      return "bg-blue-50 text-blue-700 border-blue-200/60";
    case "Back":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    case "Legs":
      return "bg-amber-50 text-amber-700 border-amber-200/60";
    case "Shoulders":
      return "bg-purple-50 text-purple-700 border-purple-200/60";
    case "Arms":
      return "bg-rose-50 text-rose-700 border-rose-200/60";
    case "Core":
      return "bg-teal-50 text-teal-700 border-teal-200/60";
    case "Cardio":
      return "bg-cyan-50 text-cyan-700 border-cyan-200/60";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200/60";
  }
}
