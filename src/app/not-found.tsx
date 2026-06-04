import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dumbbell, ArrowLeft } from "lucide-react";
import { routes } from "@/config/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-6">
        <Dumbbell className="h-6 w-6" />
      </div>
      
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Page Not Found
      </h1>
      
      <p className="mt-2 text-base text-muted-foreground max-w-sm">
        Sorry, we couldn&apos;t find the page you are looking for. It might have been moved or deleted.
      </p>
      
      <div className="mt-8">
        <Link
          href={routes.dashboard}
          className={cn(
            buttonVariants(),
            "flex items-center gap-2"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
