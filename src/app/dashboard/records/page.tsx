import { PageHeader } from "@/components/layout/page-header";
import { RecordsTable } from "@/features/records/components/records-table";
import { getPersonalRecords } from "@/features/records/services/records-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Records",
};

export default async function RecordsPage() {
  const records = await getPersonalRecords();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personal Records"
        description="View your best lifts, calculated 1-rep maxes, and strength streaks."
      />

      <RecordsTable initialRecords={records} />
    </div>
  );
}
