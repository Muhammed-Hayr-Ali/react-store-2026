// ===============================================================================
// Sign Up With Password & Generate Welcome Discount Code & Send Welcome Email

import { createBrowserClient } from "@/lib/database/supabase/client";
import { ApiResult } from "@/lib/database/types";
import type { SignUpInput } from "./types";
import { signUpSchema, validateInput, logAuthentication } from "@/lib/security";
import { verifyCsrfToken } from "@/lib/security/csrf-server-action";

// ===============================================================================
export async function signUpWithPassword(
  _prevState: unknown,
  formData: FormData,
): Promise<ApiResult> {
  const csrfCheck = await verifyCsrfToken(formData);
  if (!csrfCheck.valid) {
    return {
      success: false,
      error: "CSRF_ERROR",
    };
  }

  const input: SignUpInput = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validation = validateInput(signUpSchema, input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.errors.join(", "),
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
