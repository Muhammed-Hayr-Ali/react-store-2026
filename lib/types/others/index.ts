import type { AuthError } from "@supabase/supabase-js";

export type ResetPasswordResult = {
  error: AuthError | null;
};




export type UnsubscribeResult = {
  data: { message: string } | null;
  error: { message: string } | null;
};

