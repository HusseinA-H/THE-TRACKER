import { PageHeader } from "@/components/layout/page-header";
import { getScheduleSettings } from "@/features/workouts/services/schedule-service";
import { ScheduleView } from "@/features/workouts/components/schedule-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rotation Training Schedule",
};

export default async function SchedulePage() {
  const settings = await getScheduleSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workout Schedule"
        description="Review and align your custom rolling 10-day Upper/Lower hypertrophy split rotation."
      />

      <ScheduleView initialSettings={settings} />
    </div>
  );
}
