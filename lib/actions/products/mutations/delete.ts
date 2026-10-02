"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasRole } from "../../role/role-checker"
import { hasPermission } from "../../role/permission-checker"

export async function deleteProduct(
  productId: string
): Promise<ApiResult<{ id: string }>> {
  if (!productId || typeof productId !== "string") {
    return {
      success: false,
      error: "INVALID_PRODUCT_ID",
      details: { database: ["Product ID is required."] },
    }
  }

  // 1. التحقق من الصلاحيات
  const [isAdmin, canDelete] = await Promise.all([
    hasRole("admin"),
    hasPermission("delete_product"),
  ])

  if (!isAdmin || !canDelete) {
    console.error(
      "❌ [DeleteProduct] Unauthorized Access: User lacks admin role or delete_product permission"
    )
    return { success: false, error: "UNAUTHORIZED_ACCESS" }
  }

  const supabase = await createServerClient()

  // 2. التحقق من وجود المنتج ومعرفة الـ slug الخاص به لتنظيف الكاش
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("id, slug")
    .eq("id", productId)
    .single()

  if (fetchError || !product) {
    return {
      success: false,
      error: "PRODUCT_NOT_FOUND",
      details: { database: [fetchError?.message || "Product not found."] },
    }
  }

  // 3. حذف السجلات المرتبطة بالمنتج (المتغيرات والصور) في حال لم يكن الـ Cascade مفعلاً في قاعدة البيانات
  const [deleteImagesResult, deleteVariantsResult] = await Promise.all([
    supabase.from("product_images").delete().eq("product_id", productId),
    supabase.from("product_variants").delete().eq("product_id", productId),
  ])

  if (deleteImagesResult.error) {
    console.error("❌ [DeleteProduct] Failed to delete product images:", deleteImagesResult.error)
  }

  if (deleteVariantsResult.error) {
    console.error("❌ [DeleteProduct] Failed to delete product variants:", deleteVariantsResult.error)
  }

  // 4. حذف سجل المنتج الأساسي
  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)

  if (deleteError) {
    console.error("❌ [DeleteProduct] Delete Error:", deleteError)
    return {
      success: false,
      error: "DELETE_PRODUCT_ERROR",
      details: { database: [deleteError.message] },
    }
  }

  // 5. إعادة تحديث كاش الصفحات ذات الصلة
  revalidatePath("/dashboard/products")
  revalidatePath(`/dashboard/products/${product.slug}/edit`)
  revalidatePath(`/product/${product.slug}`)

  console.log(`✅ [DeleteProduct] Successfully deleted product ID: ${productId}`)

  return {
    success: true,
    data: { id: productId },
  }
}