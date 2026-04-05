import { createBrowserClient } from "@/lib/database/supabase/client";
import type { ApiResult } from "@/lib/database/types";

export async function signInWithGoogle(): Promise<ApiResult> {
  const supabase = createBrowserClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    console.error("Missing NEXT_PUBLIC_APP_URL environment variable");
    return {
      success: false,
      error: "Application URL is not configured",
    };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Supabase Google Sign-In Error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }

  // OAuth redirect succeeded - user will be redirected to Google
  return {
    success: true,
  };
}
