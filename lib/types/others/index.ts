import type { AuthError, AuthResponse } from "@supabase/supabase-js";

export type ResetPasswordResult = {
  error: AuthError | null;
};




export type UnsubscribeResult = {
  data: { message: string } | null;
  error: { message: string } | null;
};



export type VerifyMfaResult = {
  data: AuthResponse["data"] | null;
  error: AuthError | null;
};
