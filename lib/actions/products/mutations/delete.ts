/**
 * @file lib/actions/products/mutations/delete.ts
 * @description Server Action to safely remove a product.
 * Database CASCADE handles relational entities (variants, images, reviews).
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"

import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "../../types/utils"
 import { getValidationDetails } from "../../validation"

export async function deleteProduct(
  productId: string
): Promise<ApiResult<{ id: string }>> {
  
  // 1. التحقق من صحة المعرف (UUID)
  const idValidation = z.string().uuid("INVALID_PRODUCT_ID").safeParse(productId)
  
  if (!idValidation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(idValidation.error),
    }
  }
  
  const validProductId = idValidation.data

 
  const supabase = await createServerClient()

  // 3. التحقق من وجود المنتج للحصول على הSlug (من أجل مسح الكاش لاحقاً)
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("id, slug")
    .eq("id", validProductId)
    .single()

  if (fetchError || !product) {
    return {
      success: false,
      error: "PRODUCT_NOT_FOUND",
      details: { database: [fetchError?.message || "Product not found."] },
    }
  }

  // 4. حذف المنتج (جداول variants, images, و reviews ستحذف تلقائياً بفضل CASCADE)
  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", validProductId)

  if (deleteError) {
    return {
      success: false,
      error: "DELETE_PRODUCT_ERROR",
      details: { database: [deleteError.message] },
    }
  }

  // 5. مسح الكاش (Revalidation) لتحديث الواجهات
  revalidatePath(`/product/${product.slug}`) // تنظيف صفحة المنتج من الكاش
  revalidatePath("/dashboard/products") // تنظيف لوحة التحكم
  revalidatePath("/", "layout") // تنظيف القوائم العامة

  return {
    success: true,
    data: { id: validProductId },
  }
}