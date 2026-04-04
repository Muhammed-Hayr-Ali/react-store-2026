import { createBrowserClient } from "@/lib/database/supabase/client";
import { ApiResult } from "@/lib/database/types";
import type { SignInInput } from "./types";

export async function signInWithPassword({
  email,
  password,
}: SignInInput): Promise<ApiResult> {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Error signing in:", error);
    return {
      success: false,
      error: "USER_SIGNIN_ERROR",
    };
  }

  return { success: true };
}
