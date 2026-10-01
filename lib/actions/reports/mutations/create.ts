"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { CreateReportInput, createReportSchema } from "../types"

export async function submitReport(input: CreateReportInput) {
  const validation = createReportSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_FAILED",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: "UNAUTHORIZED",
      message: "You must be logged in to submit a report",
    }
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: validation.data.targetType,
    target_id: validation.data.targetId || null,
    reason: validation.data.reason,
    details: validation.data.details || null,
    status: "pending",
  })

  if (error) {
    return {
      success: false,
      error: "INSERT_FAILED",
      message: error.message,
    }
  }

  return {
    success: true,
    message: "Report submitted successfully. Our team will review it shortly.",
  }
}
