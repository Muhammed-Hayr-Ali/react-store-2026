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
import { hasPermission, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function updateFlashSale(
  saleId: string,
  rawData: FlashSaleFormInput
): Promise<ApiResult<null>> {
  // 1. Permission check
  const canUpdate = await hasPermission(PERMISSIONS.UPDATE_FLASH_SALE)
  if (!canUpdate) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 2. Validate payload
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

  // 3. Check for slug collision on different sale record
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

  // 4. Update main record
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

  // 5. Synchronize items
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

  // 6. Invalidate caches
  revalidatePath(`/deals/${data.slug}`)
  revalidatePath("/", "layout")

  return {
    success: true,
    data: null,
  }
}
