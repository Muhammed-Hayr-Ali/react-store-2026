import { createBrowserClient } from "@/lib/supabase/createBrowserClient";
import { ApiResult } from "@/lib/types/common";

export async function signInWithGoogle(): Promise<ApiResult> {
  
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/api/callback`,
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

  return {
    success: true,
  };
}
