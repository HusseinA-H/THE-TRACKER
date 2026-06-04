"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scale, Loader2 } from "lucide-react";
import { weightFormSchema, type WeightFormValues } from "../schemas";
import { logWeightAction } from "../actions";
import type { WeightLog } from "../types";

interface WeightFormProps {
  onSuccess?: (log: WeightLog) => void;
  latestWeight?: number | null;
}

export function WeightForm({ onSuccess, latestWeight }: WeightFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current local date in YYYY-MM-DD format
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<WeightFormValues>({
    resolver: zodResolver(weightFormSchema),
    defaultValues: {
      weight: latestWeight || undefined,
      logDate: getTodayString(),
    },
  });

  const onSubmit = async (values: WeightFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Logging weight...");
    try {
      const result = await logWeightAction(values);
      if (result.success) {
        toast.success(`Logged ${values.weight} kg for ${values.logDate}`, { id: toastId });
        onSuccess?.(result.data);
        reset({
          weight: values.weight, // Keep the latest weight as default for next logs
          logDate: getTodayString(),
        });
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch (e) {
      toast.error("Failed to log weight", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Scale className="h-5 w-5 text-muted-foreground" />
          <span>Log Weight</span>
        </CardTitle>
        <CardDescription>
          Record your daily body weight. Logging on an existing date updates it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Weight Input */}
            <div className="space-y-1.5">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="e.g. 75.4"
                {...register("weight", { valueAsNumber: true })}
                disabled={isSubmitting}
                className="font-mono"
              />
              {errors.weight && (
                <p className="text-xs font-medium text-destructive">
                  {errors.weight.message}
                </p>
              )}
            </div>

            {/* Date Input */}
            <div className="space-y-1.5">
              <Label htmlFor="logDate">Date</Label>
              <Input
                id="logDate"
                type="date"
                {...register("logDate")}
                disabled={isSubmitting}
                className="font-mono"
              />
              {errors.logDate && (
                <p className="text-xs font-medium text-destructive">
                  {errors.logDate.message}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Saving Log...</span>
              </>
            ) : (
              <span>Save Entry</span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
