import type { WeightLog } from "@/types";

export type { WeightLog };

export interface LogWeightInput {
  weight: number;
  logDate: string;
}

export interface WeightStats {
  currentWeight: number | null;
  change30Days: number | null;
  changeAllTime: number | null;
  minWeight: number | null;
  maxWeight: number | null;
}
