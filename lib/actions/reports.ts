"use server";

import { createServerClient } from "../supabase/createServerClient";


type ReportFormState = {
  success: boolean;
  message: string;
};

export async function reportReview(
  prevState: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
