import { createBrowserClient } from "@/lib/database/supabase/client";
import { ApiResult } from "@/lib/database/types";
import type { SignInInput } from "./types";
<<<<<<< HEAD
import { signInSchema, validateInput, logAuthentication } from "@/lib/security";
import { verifyCsrfToken } from "@/lib/security/csrf-server-action";

export async function signInWithPassword(
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

  const input: SignInInput = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validation = validateInput(signInSchema, input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.errors.join(", "),
    };
  }

  const { email, password } = validation.data;
=======

export async function signInWithPassword({
  email,
  password,
}: SignInInput): Promise<ApiResult> {
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
<<<<<<< HEAD
    logAuthentication("SIGN_IN_FAILED", undefined, undefined, { email });
=======
    console.error("Error signing in:", error);
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
    return {
      success: false,
      error: "USER_SIGNIN_ERROR",
    };
  }

<<<<<<< HEAD
  logAuthentication("SIGN_IN_SUCCESS", undefined, undefined, { email });

=======
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
  return { success: true };
}
