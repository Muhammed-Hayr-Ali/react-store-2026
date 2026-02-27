"use server";

import { createServerClient } from "../supabase/createServerClient";
import { getUser } from "./get-user-action";

// ===============================================================================
// File Name: reports.ts
// Description: Report Management Actions.
// Status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-02-27
// Version: 1.0
// Copyright (c) 2026 Mohammed Kher Ali
// ===============================================================================

// ================================================================================
// Api Response Type
// ================================================================================
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  [key: string]: unknown;
};

// ================================================================================
// Report Type
// ================================================================================
export type Report = {
  review_id: number;
  reason: string;
  details: string | null;
  id: number;
  user_id: string | null;
  status: string;
  resolved_at: Date | null;
  created_at: Date;
};

// ===============================================================================
// Report Payload Type
// ===============================================================================
export type ReportPayload = Omit<
  Report,
  "id" | "user_id" | "status" | "resolved_at" | "created_at"
>;

// ===============================================================================
// Create Report
// ================================================================================
export async function createReport(
  reportPayload: ReportPayload,
): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with adding a new address
  if (userError || !user) {
    console.error("AUTHENTICATION_FAILED");
  }

  const { error } = await supabase.from("review_reports").insert({
    user_id: user?.id || null,
    ...reportPayload,
  });

  if (error) {
    console.error("Error adding report:", error.message);
    return { error: "Failed to submit your report. Please try again." };
  }

  return { data: true };
}

export async function reportReview(
  formData: FormData,
): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with adding a new address
  if (userError || !user) {
    console.error("AUTHENTICATION_FAILED");
    return { error: "AUTHENTICATION_FAILED" };
  }
  // Add a new address for the authenticated user

  const reviewId = formData.get("reviewId");
  const reason = formData.get("reason");
  const details = formData.get("details");
  const reporterEmail = formData.get("reporterEmail");

  if (!reviewId || !reason) {
    return { success: false, message: "Review ID and reason are required." };
  }

  const { error } = await supabase.from("review_reports").insert({
    review_id: Number(reviewId),
    reason: reason as string,
    details: (details as string) || null,
    reporter_user_id: user?.id || null,
    reporter_email: user ? null : (reporterEmail as string),
  });

  if (error) {
    console.error("Error reporting review:", error);
    return {
      success: false,
      message: "Failed to submit your report. Please try again.",
    };
  }

  return {
    success: true,
    message: "Thank you for your report. Our team will review it shortly.",
  };
}
