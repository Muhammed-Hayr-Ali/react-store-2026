"use client";

import { createClient } from "@/lib/database/supabase/client";

/**
 * Check MFA status directly from Supabase Auth API (client-side)
 * Returns true if user has a verified TOTP factor
 */
export async function checkMfaStatusClient(): Promise<boolean> {
  const supabase = createClient();

  try {
    const { data: listFactorsData, error } =
      await supabase.auth.mfa.listFactors();

    if (error || !listFactorsData) {
      console.error("Error checking MFA status:", error?.message);
      return false;
    }

    // Check if there's a verified TOTP factor
    return listFactorsData.all.some(
      (f) => f.factor_type === "totp" && f.status === "verified"
    );
  } catch (error) {
    console.error("Error checking MFA status:", error);
    return false;
  }
}
