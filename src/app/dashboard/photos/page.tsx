import { PageHeader } from "@/components/layout/page-header";
import { getProgressPhotos } from "@/features/weight/services/photos-service";
import { PhotosView } from "@/features/weight/components/photos-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Physique Progress Photos",
};

export default async function PhotosPage() {
  const photos = await getProgressPhotos();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Progress Photos"
        description="Upload and compare Front, Side, and Back photos monthly to track your physique development."
      />

      <PhotosView initialPhotos={photos} />
    </div>
  );
}
