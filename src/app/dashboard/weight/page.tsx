import { PageHeader } from "@/components/layout/page-header";
import { WeightStats } from "@/features/weight/components/weight-stats";
import { WeightForm } from "@/features/weight/components/weight-form";
import { WeightChart } from "@/features/weight/components/weight-chart";
import { WeightHistory } from "@/features/weight/components/weight-history";
import { getWeightHistory, getWeightStats } from "@/features/weight/services/weight-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weight Tracker",
};

export default async function WeightPage() {
  const [logs, stats] = await Promise.all([
    getWeightHistory(),
    getWeightStats(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weight Tracker"
        description="Monitor daily body weight metrics, view historical trends, and calculate loss/gain goals."
      />

      {/* Summary KPI stats */}
      <WeightStats stats={stats} />

      {/* Visual analytics chart */}
      {logs.length > 0 && <WeightChart logs={logs} />}

      {/* Main split grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left column (2/3 width) - History log table */}
        <div className="md:col-span-2">
          <WeightHistory logs={logs} />
        </div>

        {/* Right column (1/3 width) - Form log entry */}
        <div>
          <WeightForm latestWeight={stats.currentWeight} />
        </div>
      </div>
    </div>
  );
}
