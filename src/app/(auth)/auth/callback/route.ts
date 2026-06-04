import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if user has a profile or if the trigger created it.
      // Redirect to the dashboard
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("Auth exchange error:", error);
  }

  // Return the user to login with an error query param
  return NextResponse.redirect(
    `${origin}/login?error=auth-code-exchange-failed`
  );
}
