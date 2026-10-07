/**
 * @file lib/actions/flash-sales/mutations/update.ts
 * @description Server Action to update flash sale campaign attributes and synchronize item discounts.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { FlashSaleFormInput } from "../types"
import { flashSaleFormSchema } from "../schemas"
import { hasPermission, PERMISSIONS } from "../../role"

export async function updateFlashSale(
  saleId: string,
  rawData: FlashSaleFormInput
): Promise<ApiResult<null>> {
  // 0. Validate saleId UUID
  const idValidation = z.string().uuid("INVALID_SALE_ID").safeParse(saleId)
  if (!idValidation.success) {
    return { success: false, error: "INVALID_SALE_ID" }
  }
  const validSaleId = idValidation.data

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
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parseResult.error.issues) {
      const path = issue.path.join(".")
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: fieldErrors,
    }
  }

  const data = parseResult.data
  const supabase = await createServerClient()

  // 3. Check for slug collision on different sale record
  const { data: existingSlug } = await supabase
    .from("flash_sales")
    .select("id")
    .eq("slug", data.slug)
    .neq("id", validSaleId)
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
    .eq("id", validSaleId)

  if (saleError) {
    return {
      success: false,
      error: "UPDATE_FLASH_SALE_ERROR",
      details: { database: [saleError.message] },
    }
  }

  // 5. Synchronize items
  await supabase
    .from("flash_sale_items")
    .delete()
    .eq("flash_sale_id", validSaleId)

  const itemsToInsert = data.items.map((item) => ({
    flash_sale_id: validSaleId,
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
  revalidatePath("/", "layout")

  return {
    success: true,
    data: null,
  }
}
