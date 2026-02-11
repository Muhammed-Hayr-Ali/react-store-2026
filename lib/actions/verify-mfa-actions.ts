import { createBrowserClient } from "@/lib/supabase/createBrowserClient";
import { VerifyMfaResult } from "@/lib/types/others";
import { AuthError } from "@supabase/supabase-js";

export async function verifyMfaForLogin(
  code: string,
): Promise<VerifyMfaResult> {
  const supabase = createBrowserClient();

  const { data: factorsData, error: factorsError } =
    await supabase.auth.mfa.listFactors();

  if (factorsError) {
    console.error(
      "MFA Verify Step 1 Error (listFactors):",
      factorsError.message,
    );
    return { data: null, error: factorsError };
  }

  const totpFactor = factorsData?.totp?.[0];
  if (!totpFactor) {
    const noFactorError = new Error(
      "No active 2FA method found for this user.",
    ) as AuthError;
    noFactorError.name = "NoFactorError";
    console.error("MFA Verify Step 1.5 Error:", noFactorError.message);
    return { data: null, error: noFactorError };
  }

  // الخطوة 2: إنشاء تحدي
  const { data: challengeData, error: challengeError } =
    await supabase.auth.mfa.challenge({
      factorId: totpFactor.id,
    });

  if (challengeError) {
    console.error(
      "MFA Verify Step 2 Error (challenge):",
      challengeError.message,
    );
    return { data: null, error: challengeError };
  }

  const { data: verifyData, error: verifyError } =
    await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId: challengeData.id,
      code,
    });

  if (verifyError) {
    return { data: null, error: verifyError };
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: verifyData.access_token,
      refresh_token: verifyData.refresh_token,
    });

  if (sessionError) {
    console.error(
      "MFA Verify Step 4 Error (setSession):",
      sessionError.message,
    );
    return { data: null, error: sessionError };
  }

  // الآن، `sessionData` يحتوي على `user` و `session` بالشكل الصحيح
  return { data: sessionData, error: null };
}