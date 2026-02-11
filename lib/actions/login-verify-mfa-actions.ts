"use server";

import { AuthResponse } from "@supabase/supabase-js";
import { createServerClient } from "../supabase/createServerClient";
import { getMfaFactors, verifyMfa } from "./mfa";


// ===============================================================================
// File Name: login-verify-mfa-actions.ts
// Description: Login Verify MFA  Actions
// status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-02-010
// Version: 1.0
// Copyright (c) 2023 Mohammed Kher Ali
// ===============================================================================

// ===============================================================================
// Response Type
// ===============================================================================
export type VerifyMfaResponse = {
  data: AuthResponse["data"] | null;
  error: string | null;
};


// ===============================================================================
// Verify MFA For Login
// ===============================================================================
export async function verifyMfaForLogin(code: string): Promise<VerifyMfaResponse> {
  const supabase = await createServerClient();

  const { data: factor, error: factorError } = await getMfaFactors();

  if (factorError) {
    console.error("MFA Verify Step 1 Error (getMfaFactors):", factorError);
    return { data: null, error: factorError };
  }

  if (!factor || !factor.id) {
    console.error(
      "MFA Verify Step 2 Error (getMfaFactors):",
      "No factor found",
    );
    return { data: null, error: "No factor found" };
  }

  const totpFactorId = factor.id;

  const { data: verifyData, error: verifyError } = await verifyMfa(
    totpFactorId,
    code,
  );

  if (verifyError) {
    console.error("MFA Verify Step 2 Error (verifyMfa):", verifyError);
    return { data: null, error: verifyError };
  }

  if (!verifyData || !verifyData.access_token || !verifyData.refresh_token) {
    console.error(
      "MFA Verify Step 3 Error (verifyMfa):",
      "Missing access_token or refresh_token",
    );
    return { data: null, error: "Missing access_token or refresh_token" };
  }

  const { data: session, error: sessionError } = await supabase.auth.setSession(
    {
      access_token: verifyData.access_token,
      refresh_token: verifyData.refresh_token,
    },
  );

  if (sessionError) {
    console.error("MFA Verify Step 4 Error (setSession):", sessionError);
    return { data: null, error: sessionError.message };
  }

  return { data: session, error: null };
}
