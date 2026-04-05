"use server";

import { v4 as uuidv4 } from "uuid";
import { AuthMFAVerifyResponseData, Factor } from "@supabase/supabase-js";
import { createClient } from "@/lib/database/supabase/server";
import { ApiResult } from "@/lib/database/types";

// ===============================================================================
// File Name: mfa.ts
// Description: MFA Actions
// status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-03-16
// Version: 1.0
// Copyright (c) 2023 Mohammed Kher Ali
// ===============================================================================

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
export async function getMfaFactors(): Promise<ApiResult<Factor | null>> {
  // Create a new server client
  const supabase = await createClient()

  // Get the MFA factors
  const { data: listFactorsData, error: listFactorsError } =
    await supabase.auth.mfa.listFactors()

  // Check for errors
  if (listFactorsError) {
    console.error("Error listing MFA factors:", listFactorsError.message)
    return {
      success: false,
      error: "MFA_LIST_FACTORS_FAILED"
    }
  }

  // Check for errors
  if (!listFactorsData) {
    return {
      success: false,
      error: "MFA_LIST_FACTORS_FAILED"
    }
  }

  // Get the TOTP factor
  const factor =
    listFactorsData.all.find(
      (f) => f.factor_type === "totp" && f.status === "verified"
    ) || null

  // Check for errors
  if (!factor) {
    return {
      success: false,
      error: "MFA_LIST_FACTORS_FAILED"
    }
  }

  return {
    success: true,
    data: factor
  }
}

//===============================================================================
// Verify MFA
//===============================================================================
export async function verifyMfa(
  factorId: string,
  code: string,
): Promise<ApiResult<AuthMFAVerifyResponseData>> {

  // Create a new server client
  const supabase = await createClient()

  // Get the MFA challenge
  const { data: challengeData, error: challengeError } =
    await supabase.auth.mfa.challenge({
      factorId,
    });

  // Check for errors
  if (challengeError) {
    return {
      success: false,
      error: "MFA_VERIFY_FAILED"
    };
  }

  // Get the challenge ID
  const challengeId = challengeData.id;

  // Verify the MFA code
  const { data: verifyData, error: verifyError } =
    await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });

  // Check for errors
  if (verifyError) {
    return {
      success: false,
      error: "MFA_VERIFY_FAILED"
    };
  }

  return {
    success: true,
    data: verifyData
  };
}

//===============================================================================
// Unenroll MFA
//===============================================================================
export async function unenrollMfa(
  factorId: string,
): Promise<ApiResult<string>> {

  // Create a new server client
  const supabase = await createClient()

  // Unenroll the MFA
  const { data, error } = await supabase.auth.mfa.unenroll({
    factorId,
  });

  // Check for errors
  if (error) {
    return {
      success: false,
      error: "MFA_UNENROLL_FAILED"
    };
  }

  return {
    success: true,
    data: data.id
  };
}

//===============================================================================
// Enroll MFA
//===============================================================================
export async function enrollMfa(): Promise<ApiResult<EnrollmentData>> {


  // Create a new server client
  const supabase = await createClient()
  
  // Generate a friendly name from uuid
  const friendlyName = uuidv4();

  // Enroll the MFA
  const { data: enrollData, error: enrollError } =
    await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: friendlyName,
    });

  // Check for errors
  if (enrollError) {
    return {
      success: false,
      error: "MFA_ENROLL_FAILED"
    };
  }

  return {
    success: true,
    data: enrollData
  };
}
