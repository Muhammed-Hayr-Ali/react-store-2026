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
import { hasPermission, PERMISSIONS } from "../../role"

export async function createFlashSale(
  rawData: FlashSaleFormInput
): Promise<ApiResult<{ id: string }>> {
  // 1. Permission check
  const canCreate = await hasPermission(PERMISSIONS.CREATE_FLASH_SALE)
  if (!canCreate) {
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

  // 3. Ensure unique slug
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

  // 4. Insert parent flash sale record
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

  // 5. Insert linked campaign items
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
    await supabase.from("flash_sales").delete().eq("id", createdSale.id)
    return {
      success: false,
      error: "INSERT_FLASH_SALE_ITEMS_ERROR",
      details: { database: [itemsError.message] },
    }
  }

  // 6. Invalidate caches
  revalidatePath("/", "layout")

  return {
    success: true,
    data: { id: createdSale.id },
  }
}
