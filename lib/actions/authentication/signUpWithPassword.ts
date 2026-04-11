"use server";

import { createBrowserClient } from "@/lib/database/supabase/client";
import { ApiResult } from "@/lib/database/types";
import { signUpSchema } from "@/lib/validations/signUpSchema";
import { logAuthentication } from "@/lib/security";
import type { z } from "zod";

export async function signUpWithPassword(
  data: z.infer<typeof signUpSchema>,
): Promise<ApiResult> {
  const validation = signUpSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues.map((e) => e.message).join(", "),
    };
  }

  const { first_name, last_name, email, password } = validation.data;

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

  logAuthentication("SIGN_UP", undefined, undefined, {
    email,
    first_name,
    last_name,
  });

  return {
    success: true,
  };
}
