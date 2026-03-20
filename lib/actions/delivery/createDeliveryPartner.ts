import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import { ApiResult } from "@/lib/types/common"

export interface CreateDeliveryPartnerInput {
  company_name: string
  phone: string
  email: string
  license_number?: string
  insurance_number?: string
  vehicle_types: string
  coverage_areas?: string
  max_delivery_radius?: number
}

// ===============================================================================
// Create Delivery Partner Account
// ===============================================================================
export async function createDeliveryPartner({
  company_name,
  phone,
  email,
  license_number,
  insurance_number,
  vehicle_types,
  coverage_areas,
  max_delivery_radius,
}: CreateDeliveryPartnerInput): Promise<ApiResult & { partnerId?: string }> {
  const supabase = createBrowserClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: "USER_NOT_AUTHENTICATED",
    }
  }

  // Check if user already has a delivery partner account
  const { data: existingPartner } = await supabase
    .from("delivery_partners")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (existingPartner) {
    return {
      success: false,
      error: "DELIVERY_PARTNER_ALREADY_EXISTS",
    }
  }

  // Create delivery partner record
  const { data: partner, error } = await supabase
    .from("delivery_partners")
    .insert({
      user_id: user.id,
      company_name,
      is_individual: true,
      vehicle_types: [vehicle_types],
      phone,
      email,
      license_number,
      insurance_number,
      coverage_areas: coverage_areas ? [{ city: coverage_areas, zones: [] }] : [],
      max_delivery_radius: max_delivery_radius || 10,
      account_status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating delivery partner:", error)
    return {
      success: false,
      error: "DELIVERY_PARTNER_CREATION_ERROR",
    }
  }

  return {
    success: true,
    partnerId: partner.id,
  }
}
