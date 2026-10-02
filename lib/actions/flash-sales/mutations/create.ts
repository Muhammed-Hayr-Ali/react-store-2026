"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { FlashSaleFormInput, flashSaleFormSchema } from "../schema"

export interface ActionResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

/**
 * 1. إنشاء حملة بيع سريع جديدة مع عناصرها
 */
export async function createFlashSale(
  rawData: FlashSaleFormInput
): Promise<ActionResponse<{ id: string }>> {
  const parseResult = flashSaleFormSchema.safeParse(rawData)
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Invalid input data",
    }
  }

  const data = parseResult.data
  const supabase = await createServerClient()

  // التأكد من عدم تكرار الـ Slug
  const { data: existingSlug } = await supabase
    .from("flash_sales")
    .select("id")
    .eq("slug", data.slug)
    .maybeSingle()

  if (existingSlug) {
    return {
      success: false,
      error: "Slug already exists. Please choose a different one.",
    }
  }

  // إدراج سجل الحملة في جدول flash_sales
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
      error: saleError?.message || "Failed to create flash sale",
    }
  }

  // إدراج عناصر الحملة في جدول flash_sale_items
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
    // التراجع وحذف الحملة في حال فشل إدخال المنتجات
    await supabase.from("flash_sales").delete().eq("id", createdSale.id)
    return {
      success: false,
      error: itemsError.message || "Failed to add products to the flash sale",
    }
  }

  revalidatePath("/")
  revalidatePath("/admin/flash-sales")
  return {
    success: true,
    data: { id: createdSale.id },
    message: "Flash sale created successfully",
  }
}

/**
 * 2. تبديل حالة الحملة (تفعيل / تعطيل سريع)
 */
export async function toggleFlashSaleStatus(
  saleId: string,
  isActive: boolean
): Promise<ActionResponse> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from("flash_sales")
    .update({ is_active: isActive })
    .eq("id", saleId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin/flash-sales")
  return { success: true, message: "Flash sale status updated" }
}

/**
 * 3. حذف حملة بالكامل
 */
export async function deleteFlashSale(saleId: string): Promise<ActionResponse> {
  const supabase = await createServerClient()

  // يتم حذف العناصر المرتبطة تلقائياً بفضل قيد ON DELETE CASCADE
  const { error } = await supabase.from("flash_sales").delete().eq("id", saleId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin/flash-sales")
  return { success: true, message: "Flash sale deleted successfully" }
}
