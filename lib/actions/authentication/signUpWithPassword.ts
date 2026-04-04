// ===============================================================================
// Sign Up With Password & Generate Welcome Discount Code & Send Welcome Email

import { createBrowserClient } from "@/lib/database/supabase/client";
import { ApiResult } from "@/lib/database/types";
import type { SignUpInput } from "./types";

// ===============================================================================
export async function signUpWithPassword({
  first_name,
  last_name,
  email,
  password,
}: SignUpInput): Promise<ApiResult> {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
      },
    },
  });

  if (error) {
    console.error("Error signing up:", error);

    if (error.message === "User already registered") {
      return {
        success: false,
        error: "USER_ALREADY_EXISTS",
      };
    }

    return {
      success: false,
      error: "USER_SIGNUP_ERROR",
    };
  }

  return {
    success: true,
  };
}
