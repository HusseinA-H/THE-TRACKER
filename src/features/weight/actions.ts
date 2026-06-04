"use server";

import { revalidatePath } from "next/cache";
import { logWeight, deleteWeight } from "./services/weight-service";
import { weightFormSchema } from "./schemas";
import type { ActionResult } from "@/lib/utils";
import type { WeightLog, LogWeightInput } from "./types";
import { routes } from "@/config/routes";

export async function logWeightAction(
  input: LogWeightInput
): Promise<ActionResult<WeightLog>> {
  try {
    const validated = weightFormSchema.parse({
      weight: input.weight,
      logDate: input.logDate,
    });

    const result = await logWeight({
      weight: validated.weight,
      logDate: validated.logDate,
    });

    revalidatePath(routes.weight);
    revalidatePath(routes.dashboard); // Dashboard maps current weight stats
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error logging weight:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred.",
    };
  }
}

export async function deleteWeightAction(id: string): Promise<ActionResult<void>> {
  try {
    await deleteWeight(id);
    revalidatePath(routes.weight);
    revalidatePath(routes.dashboard);
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Action error deleting weight:", error);
    return {
      success: false,
      error: error.message || "Could not delete weight log.",
    };
  }
}

import {
  logMeasurement,
  deleteMeasurement,
  getMeasurementHistory,
} from "./services/measurements-service";
import { measurementFormSchema } from "./schemas";
import type { BodyMeasurement } from "@/types";

export async function logMeasurementAction(
  input: Partial<Omit<BodyMeasurement, "id" | "userId" | "createdAt">> & { logDate: string }
): Promise<ActionResult<BodyMeasurement>> {
  try {
    const validated = measurementFormSchema.parse(input);
    const result = await logMeasurement(validated);

    revalidatePath(routes.weight);
    revalidatePath("/dashboard/measurements");
    revalidatePath(routes.dashboard);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error logging measurement:", error);
    return { success: false, error: error.message || "Failed to log measurement" };
  }
}

export async function deleteMeasurementAction(id: string): Promise<ActionResult<void>> {
  try {
    await deleteMeasurement(id);
    revalidatePath(routes.weight);
    revalidatePath("/dashboard/measurements");
    revalidatePath(routes.dashboard);
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Action error deleting measurement:", error);
    return { success: false, error: error.message || "Failed to delete measurement" };
  }
}

export async function getMeasurementHistoryAction(): Promise<ActionResult<BodyMeasurement[]>> {
  try {
    const result = await getMeasurementHistory();
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error fetching measurements:", error);
    return { success: false, error: error.message || "Failed to fetch measurement history" };
  }
}

