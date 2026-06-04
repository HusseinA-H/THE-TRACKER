"use client";

import { useState, useTransition } from "react";
import { Camera, Trash2, Calendar, LayoutGrid, Sliders, Info, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { uploadProgressPhotoAction, deleteProgressPhotoAction } from "../photo-actions";
import type { ProgressPhoto } from "@/types";
import { formatDate } from "@/lib/utils";

interface PhotosViewProps {
  initialPhotos: ProgressPhoto[];
}

export function PhotosView({ initialPhotos }: PhotosViewProps) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>(initialPhotos);
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split("T")[0]);

  // Comparison State
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareCategory, setCompareCategory] = useState<"front" | "side" | "back">("front");
  const [comparePhoto1, setComparePhoto1] = useState<string>("");
  const [comparePhoto2, setComparePhoto2] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, category: "front" | "side" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side file size and type validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG/JPG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5 MB.");
      return;
    }

    const toastId = toast.loading(`Uploading ${category} photo...`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("logDate", uploadDate);

      const result = await uploadProgressPhotoAction(formData);
      if (result.success) {
        toast.success(`${category} photo uploaded successfully!`, { id: toastId });
        
        // Update local state, replacing any duplicate category on the same date
        setPhotos((prev) => {
          const filtered = prev.filter(
            (p) => !(p.category === category && p.logDate === uploadDate)
          );
          return [result.data, ...filtered].sort((a, b) => b.logDate.localeCompare(a.logDate));
        });
      } else {
        toast.error(result.error || "Failed to upload photo", { id: toastId });
      }
    } catch (err: any) {
      toast.error("An error occurred during upload", { id: toastId });
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm("Are you sure you want to delete this progress photo?")) return;

    const toastId = toast.loading("Deleting photo...");
    try {
      const result = await deleteProgressPhotoAction(id, url);
      if (result.success) {
        toast.success("Photo deleted successfully", { id: toastId });
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        
        // Reset comparison selection if deleted
        if (comparePhoto1 === url) setComparePhoto1("");
        if (comparePhoto2 === url) setComparePhoto2("");
      } else {
        toast.error(result.error || "Failed to delete photo", { id: toastId });
      }
    } catch (err) {
      toast.error("An error occurred", { id: toastId });
    }
  };

  // Group photos by date
  const groupPhotosByDate = () => {
    const groups: Record<string, Record<"front" | "side" | "back", ProgressPhoto | null>> = {};
    photos.forEach((photo) => {
      const date = photo.logDate;
      if (!groups[date]) {
        groups[date] = { front: null, side: null, back: null };
      }
      groups[date][photo.category] = photo;
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const groupedTimeline = groupPhotosByDate();

  // Get available photos for a category to compare
  const categoryPhotos = photos
    .filter((p) => p.category === compareCategory)
    .sort((a, b) => b.logDate.localeCompare(a.logDate));

  return (
    <div className="space-y-6">
      {/* Upload & Compare Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <Label htmlFor="upload-date" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> Log Date:
          </Label>
          <Input
            id="upload-date"
            type="date"
            value={uploadDate}
            onChange={(e) => setUploadDate(e.target.value)}
            className="h-9 w-40 font-mono text-xs bg-background border-border"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isCompareMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsCompareMode(!isCompareMode)}
            className="h-9 font-semibold"
          >
            <Sliders className="h-4 w-4 mr-1.5" />
            {isCompareMode ? "View Timeline" : "Compare Photos"}
          </Button>
        </div>
      </div>

      {/* COMPARE MODE PANELS */}
      {isCompareMode ? (
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">Side-by-Side Athlete Comparison</CardTitle>
                <CardDescription>Select two photo dates in a category to evaluate your physique progress.</CardDescription>
              </div>

              {/* Category Pills */}
              <div className="flex bg-muted p-0.5 rounded-lg border border-border/50 gap-0.5 w-fit">
                {(["front", "side", "back"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCompareCategory(cat);
                      setComparePhoto1("");
                      setComparePhoto2("");
                    }}
                    className={`px-3 py-1 text-[10px] font-bold capitalize rounded-md transition-all ${
                      compareCategory === cat
                        ? "bg-background text-foreground shadow-xs font-extrabold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo 1 Select */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Base Date (Photo 1)</Label>
                <select
                  value={comparePhoto1}
                  onChange={(e) => setComparePhoto1(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-semibold rounded-lg bg-background border border-border focus:ring-2 focus:ring-ring focus:outline-hidden"
                >
                  <option value="">Select Photo 1 Date...</option>
                  {categoryPhotos.map((p) => (
                    <option key={p.id} value={p.photoUrl}>
                      {formatDate(p.logDate)}
                    </option>
                  ))}
                </select>

                <div className="border rounded-2xl overflow-hidden bg-muted/20 aspect-3/4 flex items-center justify-center relative">
                  {comparePhoto1 ? (
                    <img src={comparePhoto1} alt="Compare 1" className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-muted-foreground text-center">
                      <Camera className="h-8 w-8 opacity-40 mb-2" />
                      <span className="text-xs">No date selected for base photo.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Photo 2 Select */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Comparison Date (Photo 2)</Label>
                <select
                  value={comparePhoto2}
                  onChange={(e) => setComparePhoto2(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-semibold rounded-lg bg-background border border-border focus:ring-2 focus:ring-ring focus:outline-hidden"
                >
                  <option value="">Select Photo 2 Date...</option>
                  {categoryPhotos.map((p) => (
                    <option key={p.id} value={p.photoUrl}>
                      {formatDate(p.logDate)}
                    </option>
                  ))}
                </select>

                <div className="border rounded-2xl overflow-hidden bg-muted/20 aspect-3/4 flex items-center justify-center relative">
                  {comparePhoto2 ? (
                    <img src={comparePhoto2} alt="Compare 2" className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-muted-foreground text-center">
                      <Camera className="h-8 w-8 opacity-40 mb-2" />
                      <span className="text-xs">No date selected for comparison photo.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* TIMELINE / UPLOADS VIEW */
        <div className="space-y-6">
          {/* Uploader Card */}
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-semibold">Monthly Upload Checklist</CardTitle>
              <CardDescription>Log progress photos for {formatDate(uploadDate)}.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {(["front", "side", "back"] as const).map((cat) => {
                  const existingForDate = photos.find(
                    (p) => p.category === cat && p.logDate === uploadDate
                  );

                  return (
                    <div key={cat} className="space-y-2 flex flex-col">
                      <Label className="text-xs font-bold text-muted-foreground uppercase text-center block mb-1">
                        {cat} view
                      </Label>
                      <div className="flex-1 border border-dashed border-border rounded-2xl aspect-3/4 bg-muted/10 overflow-hidden flex flex-col items-center justify-center relative group">
                        {existingForDate ? (
                          <>
                            <img
                              src={existingForDate.photoUrl}
                              alt={`${cat} view`}
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-9 w-9 rounded-full shadow-md"
                                onClick={() => handleDelete(existingForDate.id, existingForDate.photoUrl)}
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground space-y-3">
                            <Camera className="h-8 w-8 opacity-40" />
                            <span className="text-xs font-medium">No photo logged</span>
                            <label className="inline-flex items-center justify-center h-8 px-3 rounded-lg border text-[11px] font-semibold bg-background hover:bg-muted cursor-pointer shadow-xs">
                              Select Photo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, cat)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Timeline Grid */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider pl-1">Photo Log Timeline</h3>
            {groupedTimeline.length > 0 ? (
              <div className="space-y-8">
                {groupedTimeline.map(([date, block]) => (
                  <Card key={date} className="border border-border bg-card shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/40 bg-muted/5 flex flex-row justify-between items-center px-6">
                      <CardTitle className="text-sm font-bold">{formatDate(date)}</CardTitle>
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                        {Object.values(block).filter(Boolean).length} / 3 Uploads
                      </span>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        {(["front", "side", "back"] as const).map((cat) => {
                          const p = block[cat];
                          return (
                            <div key={cat} className="space-y-1">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase text-center block mb-1">
                                {cat}
                              </span>
                              <div className="border border-border/60 rounded-xl overflow-hidden aspect-3/4 bg-muted/10 flex items-center justify-center relative group">
                                {p ? (
                                  <>
                                    <img src={p.photoUrl} alt={cat} className="object-cover w-full h-full" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8 rounded-full shadow-md"
                                        onClick={() => handleDelete(p.id, p.photoUrl)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground/40 italic">Not Uploaded</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed rounded-2xl text-muted-foreground">
                <Camera className="h-10 w-10 opacity-30 mx-auto mb-3" />
                <p className="text-xs font-semibold">No progress photos logged yet.</p>
                <p className="text-[10px] mt-0.5">Start uploading monthlyFront/Side/Back photos above.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
