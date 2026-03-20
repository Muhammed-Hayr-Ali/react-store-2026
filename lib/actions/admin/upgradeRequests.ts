import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import { ApiResult } from "@/lib/types/common"

export interface ApproveUpgradeRequestInput {
  requestId: string
  adminNotes?: string
}

export interface RejectUpgradeRequestInput {
  requestId: string
  adminNotes: string
}

// ===============================================================================
// Approve Upgrade Request
// ===============================================================================
export async function approveUpgradeRequest({
  requestId,
  adminNotes,
}: ApproveUpgradeRequestInput): Promise<ApiResult> {
  const supabase = createBrowserClient()

  // Approve request
  const { error } = await supabase.rpc("approve_upgrade_request", {
    p_request_id: requestId,
    p_admin_notes: adminNotes || "",
  })

  if (error) {
    console.error("Error approving upgrade request:", error)
    return {
      success: false,
      error: "UPGRADE_APPROVAL_ERROR",
    }
  }

  return {
    success: true,
  }
}

// ===============================================================================
// Reject Upgrade Request
// ===============================================================================
export async function rejectUpgradeRequest({
  requestId,
  adminNotes,
}: RejectUpgradeRequestInput): Promise<ApiResult> {
  const supabase = createBrowserClient()

  // Reject request
  const { error } = await supabase.rpc("reject_upgrade_request", {
    p_request_id: requestId,
    p_admin_notes: adminNotes,
  })

  if (error) {
    console.error("Error rejecting upgrade request:", error)
    return {
      success: false,
      error: "UPGRADE_REJECTION_ERROR",
    }
  }

  return {
    success: true,
  }
}

// ===============================================================================
// Complete Upgrade Request (After Payment)
// ===============================================================================
export async function completeUpgradeRequest(requestId: string): Promise<ApiResult> {
  const supabase = createBrowserClient()

  // Complete request
  const { error } = await supabase.rpc("complete_upgrade_request", {
    p_request_id: requestId,
  })

  if (error) {
    console.error("Error completing upgrade request:", error)
    return {
      success: false,
      error: "UPGRADE_COMPLETION_ERROR",
    }
  }

  return {
    success: true,
  }
}

// ===============================================================================
// Get All Upgrade Requests (Admin)
// ===============================================================================
export async function getAllUpgradeRequests(statusFilter?: string) {
  const supabase = createBrowserClient()

  const status = statusFilter === "all" ? null : statusFilter

  const { data, error } = await supabase.rpc("get_all_upgrade_requests", {
    p_status: status,
  })

  if (error) {
    console.error("Error fetching upgrade requests:", error)
    return []
  }

  return data || []
}
