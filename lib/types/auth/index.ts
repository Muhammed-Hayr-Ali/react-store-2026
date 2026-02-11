import { AuthError, AuthResponse } from "@supabase/supabase-js";


export type SignInResult = {
  data: AuthResponse["data"] | null;
  error: AuthError | null;
  mfaData: MfaFactor[] | null;
};

export interface MfaFactor {
  id: string;
  status: "verified" | "unverified";
  friendly_name?: string;
}

