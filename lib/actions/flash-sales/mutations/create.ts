/**
 * @file lib/actions/flash-sales/mutations/create.ts
 * @description Server Action to create a new flash sale campaign along with its promotional items.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { FlashSaleFormInput } from "../types"
import { flashSaleFormSchema } from "../schemas"

// ============================================================================
// Main Action Function
// ============================================================================

export async function createFlashSale(
  rawData: FlashSaleFormInput
): Promise<ApiResult<{ id: string }>> {
  // 1. Validate payload
  const parseResult = flashSaleFormSchema.safeParse(rawData)
  if (!parseResult.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: parseResult.error.flatten().fieldErrors,
    }
  }

  const data = parseResult.data
  const supabase = await createServerClient()

  // 2. Ensure unique slug
  const { data: existingSlug } = await supabase
    .from("flash_sales")
    .select("id")
    .eq("slug", data.slug)
    .maybeSingle()

  if (existingSlug) {
    return {
      success: false,
      error: "SLUG_ALREADY_EXISTS",
    }
  }

  // 3. Insert parent flash sale record
  const { data: createdSale, error: saleError } = await supabase
    .from("flash_sales")
    .insert({
      title: data.title,
      title_ar: data.titleAr || null,
      slug: data.slug,
      description: data.description || null,
      starts_at: new Date(data.startsAt).toISOString(),
      ends_at: new Date(data.endsAt).toISOString(),
      is_active: data.isActive,
    })
    .select("id")
    .single()

  if (saleError || !createdSale) {
    return {
      success: false,
      error: "CREATE_FLASH_SALE_ERROR",
      details: { database: [saleError?.message || "Unknown error"] },
    }
  }

  // 4. Insert linked campaign items
  const itemsToInsert = data.items.map((item) => ({
    flash_sale_id: createdSale.id,
    product_id: item.productId,
    discount_type: item.discountType,
    discount_value: item.discountType === "none" ? null : item.discountValue,
    quantity_limit: item.quantityLimit || null,
    sold_count: 0,
  }))

  const { error: itemsError } = await supabase
    .from("flash_sale_items")
    .insert(itemsToInsert)

  if (itemsError) {
    // Rollback parent record on failure
    await supabase.from("flash_sales").delete().eq("id", createdSale.id)
    return {
      success: false,
      error: "INSERT_FLASH_SALE_ITEMS_ERROR",
      details: { database: [itemsError.message] },
    }
  }

  // 5. Invalidate caches
  revalidatePath("/")
  revalidatePath("/admin/flash-sales")

  return {
    success: true,
    data: { id: createdSale.id },
  }
}
