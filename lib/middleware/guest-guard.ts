import { redirect } from "next/navigation";
import { createClient } from "@/lib/database/supabase/server";
import { appRouter } from "@/lib/navigation";

/**
 * Redirects authenticated users away from guest-only pages.
 * If the user IS logged in, redirect them to the home page.
 * If NOT logged in, render the page (sign-in, sign-up, etc.).
 */
export async function GuestGuard(): Promise<null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!error && user) {
    // Full page redirect to home — AuthProvider.refresh() will load user info
    redirect(appRouter.home);
  }

  return null;
}
