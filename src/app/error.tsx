"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global app error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-6">
        <AlertCircle className="h-6 w-6" />
      </div>
      
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Something went wrong!
      </h1>
      
      <p className="mt-2 text-base text-muted-foreground max-w-md">
        An error occurred while loading this page. Please try resetting the viewport or returning to the dashboard.
      </p>
      
      <div className="mt-8 flex items-center justify-center gap-4">
        <Button onClick={reset} className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          <span>Try Again</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
