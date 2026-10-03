/**
 * @file lib/actions/flash-sales/mutations/update.ts
 * @description Server Action to update flash sale campaign attributes and synchronize item discounts.
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

export async function updateFlashSale(
  saleId: string,
  rawData: FlashSaleFormInput
): Promise<ApiResult<null>> {
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

  // 2. Check for slug collision on different sale record
  const { data: existingSlug } = await supabase
    .from("flash_sales")
    .select("id")
    .eq("slug", data.slug)
    .neq("id", saleId)
    .maybeSingle()

  if (existingSlug) {
    return {
      success: false,
      error: "SLUG_ALREADY_EXISTS",
    }
  }

  // 3. Update main record
  const { error: saleError } = await supabase
    .from("flash_sales")
    .update({
      title: data.title,
      title_ar: data.titleAr || null,
      slug: data.slug,
      description: data.description || null,
      starts_at: new Date(data.startsAt).toISOString(),
      ends_at: new Date(data.endsAt).toISOString(),
      is_active: data.isActive,
    })
    .eq("id", saleId)

  if (saleError) {
    return {
      success: false,
      error: "UPDATE_FLASH_SALE_ERROR",
      details: { database: [saleError.message] },
    }
  }

  // 4. Synchronize items: purge existing and insert updated list
  await supabase.from("flash_sale_items").delete().eq("flash_sale_id", saleId)

  const itemsToInsert = data.items.map((item) => ({
    flash_sale_id: saleId,
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
    return {
      success: false,
      error: "UPDATE_FLASH_SALE_ITEMS_ERROR",
      details: { database: [itemsError.message] },
    }
  }

  // 5. Invalidate caches
  revalidatePath("/")
  revalidatePath(`/deals/${data.slug}`)
  revalidatePath("/admin/flash-sales")

  return {
    success: true,
    data: null,
  }
}
