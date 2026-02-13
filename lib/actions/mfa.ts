"use server";

import { AuthMFAVerifyResponseData, Factor } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { createServerClient } from "../supabase/createServerClient";

// ===============================================================================
// File Name: mfa.ts
// Description: MFA Actions
// status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-02-010
// Version: 1.0
// Copyright (c) 2023 Mohammed Kher Ali
// ===============================================================================

// ===============================================================================
// MFA Response Type
// ===============================================================================
export interface MfaResponse<T = null> {
  data?: T;
  error: string;
}

// ===============================================================================
// Enrollment Data
// ===============================================================================
export interface EnrollmentData {
  id: string;
  totp: {
    qr_code: string;
    secret: string;
  };
}

//===============================================================================
// Get MFA Factors
//===============================================================================
export async function getMfaFactors(): Promise<MfaResponse<Factor | null>> {
  const supabase = await createServerClient();
  const { data: listFactorsData, error: listFactorsError } =
    await supabase.auth.mfa.listFactors();

  if (listFactorsError) {
    console.error("Error listing MFA factors:", listFactorsError.message);
    return { data: null, error: listFactorsError.message };
  }

  if (!listFactorsData) {
    return { data: null, error: "No MFA factors found" };
  }

  const factor =
    listFactorsData.all.find(
      (f) => f.factor_type === "totp" && f.status === "verified",
    ) || null;

  if (!factor) {
    return { data: null, error: "No verified MFA factor found" };
  }
  return { data: factor, error: "" };
}

//===============================================================================
// Verify MFA
//===============================================================================
export async function verifyMfa(
  factorId: string,
  code: string,
): Promise<MfaResponse<AuthMFAVerifyResponseData | null>> {
  const supabase = await createServerClient();

  const { data: challengeData, error: challengeError } =
    await supabase.auth.mfa.challenge({
      factorId,
    });

  if (challengeError) {
    return { data: null, error: challengeError.message };
  }

  const challengeId = challengeData.id;

  const { data: verifyData, error: verifyError } =
    await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });

  if (verifyError) {
    return { data: null, error: verifyError.message };
  }
  return { data: verifyData, error: "" };
}

//===============================================================================
// Unenroll MFA
//===============================================================================
export async function unenrollMfa(
  factorId: string,
): Promise<MfaResponse<{ id: string } | null>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.mfa.unenroll({
    factorId,
  });

  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: "" };
}

//===============================================================================
// Enroll MFA
//===============================================================================
export async function enrollMfa(): Promise<MfaResponse<EnrollmentData | null>> {
  // generate a friendly name from uuid
  const friendlyName = uuidv4();

  const supabase = await createServerClient();
  const { data: enrollData, error: enrollError } =
    await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: friendlyName,
    });

  if (enrollError) {
    return { data: null, error: enrollError.message };
  }

  return { data: enrollData, error: "" };
}
