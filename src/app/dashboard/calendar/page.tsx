import { PageHeader } from "@/components/layout/page-header";
import { CalendarView } from "@/features/workouts/components/calendar-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Training Calendar",
};

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Training Calendar"
        description="View completed workouts, missed sessions, and rest days mapped to your rolling 10-day cycle."
      />

      <CalendarView />
    </div>
  );
}
