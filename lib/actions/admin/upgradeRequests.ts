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

export interface ChangeStatusInput {
  requestId: string
  newStatus: string
  adminNotes?: string
}

// ===============================================================================
// Approve Seller Upgrade Request (Client-side)
// ===============================================================================
export async function approveSellerUpgradeRequest({
  requestId,
  adminNotes,
}: ApproveUpgradeRequestInput): Promise<ApiResult> {
  const supabase = createBrowserClient()

  try {
    // Get request details first
    const { data: requestData, error: fetchError } = await supabase
      .from("seller_upgrade_requests")
      .select("seller_id, target_plan_id")
      .eq("id", requestId)
      .single()

    if (fetchError || !requestData) {
      return {
        success: false,
        error: "Request not found",
      }
    }

    // Get plan details
    const { data: planData, error: planError } = await supabase
      .from("seller_subscription_plans")
      .select("*")
      .eq("id", requestData.target_plan_id)
      .single()

    if (planError || !planData) {
      return {
        success: false,
        error: "Plan not found",
      }
    }

    // Calculate end date
    let endDate: string | null = null
    if (planData.billing_period === "yearly") {
      const date = new Date()
      date.setFullYear(date.getFullYear() + 1)
      endDate = date.toISOString()
    } else if (planData.billing_period !== "lifetime") {
      const date = new Date()
      date.setMonth(date.getMonth() + 1)
      endDate = date.toISOString()
    }

    // Update request status
    const { error: updateRequestError } = await supabase
      .from("seller_upgrade_requests")
      .update({
        status: "approved",
        admin_notes: adminNotes || "",
        contacted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (updateRequestError) {
      return {
        success: false,
        error: "Failed to update request",
      }
    }

    // Upsert subscription
    const { error: upsertError } = await supabase
      .from("seller_subscriptions")
      .upsert(
        {
          seller_id: requestData.seller_id,
          plan_id: requestData.target_plan_id,
          status: "active",
          start_date: new Date().toISOString(),
          end_date: endDate,
          payment_provider: "manual",
          amount_paid: planData.price_usd,
          currency: "USD",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "seller_id",
        }
      )

    if (upsertError) {
      return {
        success: false,
        error: "Failed to create subscription",
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error approving seller upgrade request:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// ===============================================================================
// Approve Delivery Partner Upgrade Request (Client-side)
// ===============================================================================
export async function approveDeliveryUpgradeRequest({
  requestId,
  adminNotes,
}: ApproveUpgradeRequestInput): Promise<ApiResult> {
  const supabase = createBrowserClient()

  try {
    // Get request details first
    const { data: requestData, error: fetchError } = await supabase
      .from("delivery_upgrade_requests")
      .select("delivery_partner_id, target_plan_id")
      .eq("id", requestId)
      .single()

    if (fetchError || !requestData) {
      return {
        success: false,
        error: "Request not found",
      }
    }

    // Get plan details
    const { data: planData, error: planError } = await supabase
      .from("delivery_subscription_plans")
      .select("*")
      .eq("id", requestData.target_plan_id)
      .single()

    if (planError || !planData) {
      return {
        success: false,
        error: "Plan not found",
      }
    }

    // Calculate end date
    let endDate: string | null = null
    if (planData.billing_period === "yearly") {
      const date = new Date()
      date.setFullYear(date.getFullYear() + 1)
      endDate = date.toISOString()
    } else if (planData.billing_period !== "lifetime") {
      const date = new Date()
      date.setMonth(date.getMonth() + 1)
      endDate = date.toISOString()
    }

    // Update request status
    const { error: updateRequestError } = await supabase
      .from("delivery_upgrade_requests")
      .update({
        status: "approved",
        admin_notes: adminNotes || "",
        contacted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (updateRequestError) {
      return {
        success: false,
        error: "Failed to update request",
      }
    }

    // Upsert subscription
    const { error: upsertError } = await supabase
      .from("delivery_partner_subscriptions")
      .upsert(
        {
          delivery_partner_id: requestData.delivery_partner_id,
          plan_id: requestData.target_plan_id,
          status: "active",
          start_date: new Date().toISOString(),
          end_date: endDate,
          payment_provider: "manual",
          amount_paid: planData.price_usd,
          currency: "USD",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "delivery_partner_id",
        }
      )

    if (upsertError) {
      return {
        success: false,
        error: "Failed to create subscription",
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error approving delivery upgrade request:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// ===============================================================================
// Reject Seller Upgrade Request (Client-side)
// ===============================================================================
export async function rejectSellerUpgradeRequest({
  requestId,
  adminNotes,
}: RejectUpgradeRequestInput): Promise<ApiResult> {
  const supabase = createBrowserClient()

  try {
    const { error } = await supabase
      .from("seller_upgrade_requests")
      .update({
        status: "rejected",
        admin_notes: adminNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (error) {
      return {
        success: false,
        error: "Failed to reject request",
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error rejecting seller upgrade request:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// ===============================================================================
// Reject Delivery Partner Upgrade Request (Client-side)
// ===============================================================================
export async function rejectDeliveryUpgradeRequest({
  requestId,
  adminNotes,
}: RejectUpgradeRequestInput): Promise<ApiResult> {
  const supabase = createBrowserClient()

  try {
    const { error } = await supabase
      .from("delivery_upgrade_requests")
      .update({
        status: "rejected",
        admin_notes: adminNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (error) {
      return {
        success: false,
        error: "Failed to reject request",
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error rejecting delivery upgrade request:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// ===============================================================================
// Complete Upgrade Request (Client-side - Generic)
// ===============================================================================
export async function completeUpgradeRequest(
  requestId: string
): Promise<ApiResult> {
  const supabase = createBrowserClient()

  try {
    // Try to find in seller requests first
    let { data: requestData, error: fetchError } = await supabase
      .from("seller_upgrade_requests")
      .select("seller_id, target_plan_id")
      .eq("id", requestId)
      .single()

    let isSeller = true

    // If not found, try delivery requests
    if (fetchError || !requestData) {
      const { data: deliveryData, error: deliveryError } = await supabase
        .from("delivery_upgrade_requests")
        .select("delivery_partner_id, target_plan_id")
        .eq("id", requestId)
        .single()

      if (deliveryError || !deliveryData) {
        return {
          success: false,
          error: "Request not found",
        }
      }

      requestData = {
        seller_id: deliveryData.delivery_partner_id,
        plan_id: deliveryData.target_plan_id,
      }
      isSeller = false
    }

    // Get plan details
    const { data: planData } = await supabase
      .from(
        isSeller ? "seller_subscription_plans" : "delivery_subscription_plans"
      )
      .select("*")
      .eq("id", requestData.target_plan_id)
      .single()

    if (!planData) {
      return {
        success: false,
        error: "Plan not found",
      }
    }

    // Calculate end date
    let endDate: string | null = null
    if (planData.billing_period === "yearly") {
      const date = new Date()
      date.setFullYear(date.getFullYear() + 1)
      endDate = date.toISOString()
    } else if (planData.billing_period !== "lifetime") {
      const date = new Date()
      date.setMonth(date.getMonth() + 1)
      endDate = date.toISOString()
    }

    // Update request status
    const { error: updateRequestError } = await supabase
      .from(isSeller ? "seller_upgrade_requests" : "delivery_upgrade_requests")
      .update({
        status: "completed",
        payment_received_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (updateRequestError) {
      return {
        success: false,
        error: "Failed to update request",
      }
    }

    // Upsert subscription
    const { error: upsertError } = await supabase
      .from(
        isSeller ? "seller_subscriptions" : "delivery_partner_subscriptions"
      )
      .upsert(
        {
          [isSeller ? "seller_id" : "delivery_partner_id"]:
            requestData.seller_id,
          plan_id: requestData.target_plan_id,
          status: "active",
          start_date: new Date().toISOString(),
          end_date: endDate,
          payment_provider: "manual",
          amount_paid: planData.price_usd,
          currency: "USD",
          last_payment_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: isSeller ? "seller_id" : "delivery_partner_id",
        }
      )

    if (upsertError) {
      return {
        success: false,
        error: "Failed to create subscription",
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error completing upgrade request:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// ===============================================================================
// Change Upgrade Request Status (Client-side - Generic)
// ===============================================================================
export async function changeUpgradeRequestStatus({
  requestId,
  newStatus,
  adminNotes,
}: ChangeStatusInput): Promise<ApiResult> {
  const supabase = createBrowserClient()

  try {
    const validStatuses = ["pending", "approved", "rejected", "completed"]

    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        error: "Invalid status",
      }
    }

    // Try to find in seller requests first
    let { data: requestData, error: fetchError } = await supabase
      .from("seller_upgrade_requests")
      .select("*")
      .eq("id", requestId)
      .single()

    let isSeller = true

    // If not found, try delivery requests
    if (fetchError || !requestData) {
      const { data: deliveryData, error: deliveryError } = await supabase
        .from("delivery_upgrade_requests")
        .select("*")
        .eq("id", requestId)
        .single()

      if (deliveryError || !deliveryData) {
        return {
          success: false,
          error: "Request not found",
        }
      }

      requestData = deliveryData
      isSeller = false
    }

    // Update request status
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (newStatus !== "pending") {
      updateData.admin_notes = adminNotes || ""
      updateData.contacted_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from(isSeller ? "seller_upgrade_requests" : "delivery_upgrade_requests")
      .update(updateData)
      .eq("id", requestId)

    if (error) {
      return {
        success: false,
        error: "Failed to change status",
      }
    }

    // If status changed to approved, also create/update subscription
    if (newStatus === "approved" && requestData) {
      // Get plan details
      const { data: planData } = await supabase
        .from(
          isSeller ? "seller_subscription_plans" : "delivery_subscription_plans"
        )
        .select("*")
        .eq("id", requestData.target_plan_id)
        .single()

      if (planData) {
        // Calculate end date
        let endDate: string | null = null
        if (planData.billing_period === "yearly") {
          const date = new Date()
          date.setFullYear(date.getFullYear() + 1)
          endDate = date.toISOString()
        } else if (planData.billing_period !== "lifetime") {
          const date = new Date()
          date.setMonth(date.getMonth() + 1)
          endDate = date.toISOString()
        }

        // Upsert subscription
        await supabase
          .from(
            isSeller ? "seller_subscriptions" : "delivery_partner_subscriptions"
          )
          .upsert(
            {
              [isSeller ? "seller_id" : "delivery_partner_id"]: isSeller
                ? (requestData as any).seller_id
                : (requestData as any).delivery_partner_id,
              plan_id: requestData.target_plan_id,
              status: "active",
              start_date: new Date().toISOString(),
              end_date: endDate,
              payment_provider: "manual",
              amount_paid: planData.price_usd,
              currency: "USD",
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: isSeller ? "seller_id" : "delivery_partner_id",
            }
          )
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error changing upgrade request status:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// ===============================================================================
// Get Seller Upgrade Requests (Client-side)
// ===============================================================================
export async function getSellerUpgradeRequests() {
  const supabase = createBrowserClient()

  try {
    const { data, error } = await supabase
      .from("seller_upgrade_requests")
      .select(
        `
        *,
        sellers:seller_id (
          id,
          store_name,
          seller_email:email,
          phone,
          store_description,
          store_slug,
          address,
          tax_number,
          commercial_registration
        ),
        current_plan:current_plan_id (name),
        target_plan:target_plan_id (name, price_usd)
      `
      )
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching seller upgrade requests:", error)
      return []
    }

    // Parse address JSON if it's a string
    const parsedData = (data || []).map((item: any) => ({
      ...item,
      sellers: {
        ...item.sellers,
        address:
          typeof item.sellers?.address === "string"
            ? JSON.parse(item.sellers.address)
            : item.sellers?.address,
      },
    }))

    return parsedData || []
  } catch (error) {
    console.error("Error fetching seller upgrade requests:", error)
    return []
  }
}

// ===============================================================================
// Get Delivery Partner Upgrade Requests (Client-side)
// ===============================================================================
export async function getDeliveryUpgradeRequests() {
  const supabase = createBrowserClient()

  try {
    const { data, error } = await supabase
      .from("delivery_upgrade_requests")
      .select(
        `
        *,
        delivery_partner:delivery_partner_id (
          id,
          company_name,
          partner_email:email,
          phone,
          vehicle_types,
          coverage_areas,
          max_delivery_radius,
          license_number,
          insurance_number
        ),
        current_plan:current_plan_id (name),
        target_plan:target_plan_id (name, price_usd)
      `
      )
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching delivery upgrade requests:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching delivery upgrade requests:", error)
    return []
  }
}
