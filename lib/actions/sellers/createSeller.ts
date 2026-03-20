import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import { ApiResult } from "@/lib/types/common"

export interface CreateSellerInput {
  store_name: string
  store_description?: string
  phone: string
  email: string
  tax_number?: string
  commercial_registration?: string
  street?: string
  city: string
  country?: string
}

// ===============================================================================
// Create Seller Account
// ===============================================================================
export async function createSeller({
  store_name,
  store_description,
  phone,
  email,
  tax_number,
  commercial_registration,
  street,
  city,
  country,
}: CreateSellerInput): Promise<ApiResult & { sellerId?: string }> {
  const supabase = createBrowserClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: "USER_NOT_AUTHENTICATED",
    }
  }

  // Check if user already has a seller account
  const { data: existingSeller } = await supabase
    .from("sellers")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (existingSeller) {
    return {
      success: false,
      error: "SELLER_ALREADY_EXISTS",
    }
  }

  // Create seller record
  const { data: seller, error } = await supabase
    .from("sellers")
    .insert({
      user_id: user.id,
      store_name,
      store_slug: store_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-"),
      store_description,
      phone,
      email,
      tax_number,
      commercial_registration,
      address: {
        street,
        city,
        country: country || "Saudi Arabia",
      },
      account_status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating seller:", error)
    return {
      success: false,
      error: "SELLER_CREATION_ERROR",
    }
  }

  return {
    success: true,
    sellerId: seller.id,
  }
}
