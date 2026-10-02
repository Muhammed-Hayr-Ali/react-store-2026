"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { flashSaleFormSchema, FlashSaleFormInput } from "../schema"

export interface ActionResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export async function updateFlashSale(
  saleId: string,
  rawData: FlashSaleFormInput
): Promise<ActionResponse> {
  const parseResult = flashSaleFormSchema.safeParse(rawData)
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Invalid input data",
    }
  }

  const data = parseResult.data
  const supabase = await createServerClient()

  // فحص عدم تكرار الـ slug مع حملة أخرى
  const { data: existingSlug } = await supabase
    .from("flash_sales")
    .select("id")
    .eq("slug", data.slug)
    .neq("id", saleId)
    .maybeSingle()

  if (existingSlug) {
    return {
      success: false,
      error: "Slug already exists. Please choose a different one.",
    }
  }

  // تحديث جدول flash_sales
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
      error: saleError.message || "Failed to update flash sale",
    }
  }

  // مزامنة العناصر: حذف العناصر القديمة وإعادة إدراج القائمة الجديدة
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
      error: itemsError.message || "Failed to update flash sale products",
    }
  }

  revalidatePath("/")
  revalidatePath("/dashboard/flash-sales")
  return {
    success: true,
    message: "Flash sale updated successfully",
  }
}
