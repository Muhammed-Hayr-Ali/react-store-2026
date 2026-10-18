"use server"

/**
 * @file lib/actions/products/update.ts
 * @description Server action for updating an existing product, its variants, and images.
 * Uses smart Upserting (by SKU) to preserve existing variant IDs for relational integrity.
 */

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { updateProductSchema, type UpdateProductInput } from "../schemas"
import type { ProductWithRelations } from "../types"

export type UpdateProductResult =
  | { success: true; data: ProductWithRelations }
  | { success: false; error: string }

export async function updateProduct(
  input: UpdateProductInput
): Promise<UpdateProductResult> {
  try {
    // 1. التحقق من الصلاحيات
    const canUpdate = await hasPermission(PERMISSIONS.UPDATE_PRODUCT)
    if (!canUpdate) {
      return { success: false, error: "PERMISSION_DENIED" }
    }

    // 2. التحقق من صحة البيانات (Zod Validation)
    const validation = updateProductSchema.safeParse(input)
    if (!validation.success) {
      return { success: false, error: "VALIDATION_ERROR" }
    }

    const { id, variants, images, ...productData } = validation.data
    const supabase = await createServerClient()

    // 3. التحقق من عدم تضارب الـ Slug مع منتج آخر (استثناء المنتج الحالي)
    const { count: slugCount, error: slugError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("slug", productData.slug)
      .neq("id", id) // استثناء المنتج الجاري تعديله

    if (slugError) {
      return { success: false, error: "DATABASE_ERROR" }
    }

    if (slugCount && slugCount > 0) {
      return { success: false, error: "PRODUCT_SLUG_ALREADY_EXISTS" }
    }

    // 4. تحديث بيانات المنتج الأساسي
    const { error: updateError } = await supabase
      .from("products")
      .update({
        ...productData,
        updated_at: new Date().toISOString(), // أو نعتمد على تريجر قاعدة البيانات
      })
      .eq("id", id)

    if (updateError) {
      return { success: false, error: "UPDATE_PRODUCT_FAILED" }
    }

    // ========================================================================
    // 5. مزامنة المتغيرات (Variants Sync)
    // ========================================================================
    const incomingSkus = variants.map((v) => v.sku)

    // أ. حذف المتغيرات المرتبطة بالمنتج والتي لم تعد موجودة في الطلب الجديد
    const { error: deleteVariantsError } = await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", id)
      .not("sku", "in", `(${incomingSkus.join(",")})`) // Supabase JS filter

    if (deleteVariantsError) {
      return { success: false, error: "SYNC_VARIANTS_FAILED" }
    }

    // ب. تحديث أو إدراج (Upsert) المتغيرات الحالية والجديدة بناءً على SKU
    const variantsToUpsert = variants.map((variant) => ({
      ...variant,
      product_id: id,
    }))

    const { error: upsertVariantsError } = await supabase
      .from("product_variants")
      .upsert(variantsToUpsert, { onConflict: "sku" })

    if (upsertVariantsError) {
      return { success: false, error: "UPDATE_VARIANTS_FAILED" }
    }

    // ========================================================================
    // 6. مزامنة الصور (Images Sync)
    // بما أن الصور ليس لها ارتباطات خارجية حيوية كالـ SKU، نقوم بمسحها وإعادة بنائها
    // لضمان الترتيب وتحديث الرابط للصورة الرئيسية
    // ========================================================================
    const { error: deleteImagesError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", id)

    if (deleteImagesError) {
      return { success: false, error: "SYNC_IMAGES_FAILED" }
    }

    const imagesToInsert = images.map((img) => ({
      ...img,
      product_id: id,
    }))

    const { error: insertImagesError } = await supabase
      .from("product_images")
      .insert(imagesToInsert)

    if (insertImagesError) {
      return { success: false, error: "UPDATE_IMAGES_FAILED" }
    }

    // ========================================================================
    // 7. جلب المنتج المحدث بالكامل لإرجاعه للواجهة
    // ========================================================================
    const { data: finalProduct, error: fetchError } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(id, name, name_ar, slug, parent_id),
        brand:brands(id, name, name_ar, slug, logo_url),
        product_variants(*),
        product_images(*)
      `)
      .eq("id", id)
      .single()

    if (fetchError || !finalProduct) {
      return { success: false, error: "FETCH_UPDATED_PRODUCT_FAILED" }
    }

    // 8. تحديث الكاش في Next.js
    revalidatePath("/dashboard/products")
    revalidatePath("/products")
    revalidatePath(`/products/${finalProduct.slug}`)

    return {
      success: true,
      data: finalProduct as unknown as ProductWithRelations,
    }
  } catch (error) {
    console.error("[updateProduct] Unexpected error:", error)
    return { success: false, error: "UNEXPECTED_ERROR" }
  }
}