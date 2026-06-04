import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dumbbell, Trophy, Scale, ArrowRight, Activity, Shield } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation header */}
      <header className="flex h-16 items-center justify-between px-6 border-b border-border bg-card">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="THE TRACKER Logo"
            width={28}
            height={28}
            priority
            style={{ width: 'auto' }}
            className="h-7 object-contain"
          />
          <span className="font-extrabold text-base tracking-tight text-foreground">
            {siteConfig.name}
          </span>
        </div>
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-border"
          )}
        >
          Open App
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center py-16 px-6 md:py-28 max-w-4xl mx-auto w-full">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border/40">
            <Activity className="h-3 w-3" />
            <span>Simplify your training log</span>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl max-w-2xl mx-auto leading-none">
            {siteConfig.tagline}
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto font-medium">
            {siteConfig.description}
          </p>

          <div className="pt-6 flex justify-center gap-4">
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 px-6 flex items-center gap-2 font-semibold"
              )}
            >
              <span>Start Tracking Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <section className="mt-20 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Workouts */}
          <div className="border border-border bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center text-foreground">
              <Dumbbell className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground mt-4">
              Workout Logging
            </h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Track sets, reps, weight, and RPE with an interactive active workout logger and built-in rest timer.
            </p>
          </div>

          {/* Weight */}
          <div className="border border-border bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center text-foreground">
              <Scale className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground mt-4">
              Weight Tracking
            </h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Log your body weight daily, view progress charts, and monitor trends to stay aligned with your goals.
            </p>
          </div>

          {/* PRs */}
          <div className="border border-border bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center text-foreground">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground mt-4">
              Personal Records
            </h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Automatically calculate your estimated 1RM and log PRs to track strength milestones over time.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 text-center text-xs text-muted-foreground">
        <div className="flex justify-center items-center gap-1.5 mb-2 font-medium">
          <Shield className="h-3.5 w-3.5" />
          <span>Google OAuth & Supabase Security</span>
        </div>
        <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}
