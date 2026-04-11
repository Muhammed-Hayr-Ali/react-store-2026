import { createBrowserClient } from "@/lib/database/supabase/client";
import { ApiResult } from "@/lib/database/types";
import { signInSchema } from "@/lib/validations/signInSchema";
import { logAuthentication } from "@/lib/security";
import type { z } from "zod";

export async function signInWithPassword(
  data: z.infer<typeof signInSchema>,
): Promise<ApiResult> {
  const validation = signInSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues.map((e) => e.message).join(", "),
    };
  }

  const { email, password } = validation.data;

  const supabase = createBrowserClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logAuthentication("SIGN_IN_FAILED", undefined, undefined, { email });
    return {
      success: false,
      error: "USER_SIGNIN_ERROR",
    };
  }

  logAuthentication("SIGN_IN_SUCCESS", undefined, undefined, { email });

  return { success: true };
}
