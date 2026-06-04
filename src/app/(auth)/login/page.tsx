import { LoginButton } from "@/features/auth/components/login-button";
import Image from "next/image";
import { siteConfig } from "@/config/site";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-card border border-border p-2.5 shadow-sm">
            <Image
              src="/logo.png"
              alt="THE TRACKER Logo"
              width={48}
              height={48}
              priority
              style={{ width: 'auto' }}
              className="h-12 object-contain"
            />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {siteConfig.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground uppercase tracking-widest font-semibold">
            {siteConfig.tagline}
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-medium text-foreground">
                Welcome to your fitness dashboard
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to log workouts, track body weight, and monitor personal records.
              </p>
            </div>

            <div className="mt-6">
              <LoginButton />
            </div>

            <div className="text-center text-xs text-muted-foreground mt-4">
              Secure authentication powered by Google OAuth and Supabase.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
