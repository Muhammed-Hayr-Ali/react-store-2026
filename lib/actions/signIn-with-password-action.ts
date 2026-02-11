import { createBrowserClient } from "@/lib/supabase/createBrowserClient";
import { SignInResult } from "@/lib/types/auth";

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<SignInResult> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { data: null, error, mfaData: null };
  }

  const { data: mfaData } = await supabase.auth.mfa.listFactors();

  if (mfaData?.all && mfaData.all.length > 0) {
    return { data: null, error: null, mfaData: mfaData.all };
  }

  return { data, error: null, mfaData: null };
}
