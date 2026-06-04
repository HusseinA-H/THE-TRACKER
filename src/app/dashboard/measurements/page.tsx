import { PageHeader } from "@/components/layout/page-header";
import { getMeasurementHistory } from "@/features/weight/services/measurements-service";
import { MeasurementsView } from "@/features/weight/components/measurements-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Body Measurements & Tracking",
};

export default async function MeasurementsPage() {
  const history = await getMeasurementHistory();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Body Measurements"
        description="Track your circumference measurements and body weight progress trends over time."
      />

      <MeasurementsView initialHistory={history} />
    </div>
  );
}
