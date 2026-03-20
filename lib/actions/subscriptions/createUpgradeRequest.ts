import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import { ApiResult } from "@/lib/types/common"

export interface CreateUpgradeRequestInput {
  sellerId?: string
  partnerId?: string
  planId: string
  contactMethod?: string
  contactValue?: string
  notes?: string
}

// ===============================================================================
// Create Seller Upgrade Request
// ===============================================================================
export async function createUpgradeRequest({
  sellerId,
  planId,
  contactMethod = "email",
  contactValue,
  notes,
}: CreateUpgradeRequestInput): Promise<ApiResult> {
  const supabase = createBrowserClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: "USER_NOT_AUTHENTICATED",
    }
  }

  if (!sellerId) {
    return {
      success: false,
      error: "SELLER_ID_REQUIRED",
    }
  }

  // Create upgrade request
  const { error } = await supabase.rpc("create_upgrade_request", {
    p_seller_id: sellerId,
    p_target_plan_id: planId,
    p_contact_method: contactMethod,
    p_contact_value: contactValue || user.email || "",
    p_seller_notes: notes || `Upgrade request`,
  })

  if (error) {
    console.error("Error creating upgrade request:", error)
    return {
      success: false,
      error: "UPGRADE_REQUEST_CREATION_ERROR",
    }
  }

  return {
    success: true,
  }
}

// ===============================================================================
// Create Delivery Partner Upgrade Request
// ===============================================================================
export async function createDeliveryUpgradeRequest({
  partnerId,
  planId,
  contactMethod = "email",
  contactValue,
  notes,
}: CreateUpgradeRequestInput): Promise<ApiResult> {
  const supabase = createBrowserClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: "USER_NOT_AUTHENTICATED",
    }
  }

  if (!partnerId) {
    return {
      success: false,
      error: "PARTNER_ID_REQUIRED",
    }
  }

  // Create upgrade request
  const { error } = await supabase.rpc("create_delivery_upgrade_request", {
    p_partner_id: partnerId,
    p_target_plan_id: planId,
    p_contact_method: contactMethod,
    p_contact_value: contactValue || user.email || "",
    p_seller_notes: notes || `Upgrade request`,
  })

  if (error) {
    console.error("Error creating delivery upgrade request:", error)
    return {
      success: false,
      error: "UPGRADE_REQUEST_CREATION_ERROR",
    }
  }

  return {
    success: true,
  }
}

// ===============================================================================
// Get Seller Upgrade Requests
// ===============================================================================
export async function getSellerUpgradeRequests(sellerId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.rpc("get_seller_upgrade_requests", {
    p_seller_id: sellerId,
  })

  if (error) {
    console.error("Error fetching upgrade requests:", error)
    return []
  }

  return data || []
}

// ===============================================================================
// Get Delivery Partner Upgrade Requests
// ===============================================================================
export async function getDeliveryUpgradeRequests(partnerId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.rpc("get_delivery_upgrade_requests", {
    p_partner_id: partnerId,
  })

  if (error) {
    console.error("Error fetching delivery upgrade requests:", error)
    return []
  }

  return data || []
}
