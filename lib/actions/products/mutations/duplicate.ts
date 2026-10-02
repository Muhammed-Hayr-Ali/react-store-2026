"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Product, ProductWithRelations, CreatedVariant } from "../types"
import { hasRole } from "../../role/role-checker"
import { hasPermission } from "../../role/permission-checker"

/**
 * عمل نسخة مكررة من منتج موجود مع إضافة Copy للاسم والسلوج وتوليد SKUs جديدة
 */
export async function duplicateProduct(
  productId: string
): Promise<ApiResult<Product | null>> {
  if (!productId) {
    return { success: false, error: "INVALID_PRODUCT_ID" }
  }

  // 1. التحقق من الصلاحيات
  const [isAdmin, canCreate] = await Promise.all([
    hasRole("admin"),
    hasPermission("create_product"),
  ])

  if (!isAdmin || !canCreate) {
    return { success: false, error: "UNAUTHORIZED_ACCESS" }
  }

  const supabase = await createServerClient()

  // 2. جلب المنتج الأصلي مع كافة العلاقات
  const { data: originalProduct, error: fetchError } = await supabase
    .from("products")
    .select(
      `
      *,
      product_variants (*),
      product_images (*)
    `
    )
    .eq("id", productId)
    .single()

  if (fetchError || !originalProduct) {
    return {
      success: false,
      error: "PRODUCT_NOT_FOUND",
      details: { database: [fetchError?.message || "Product not found"] },
    }
  }

  const orig = originalProduct as ProductWithRelations

  // 3. تجهيز الاسم والسلوج الفريد للنسخة
  const randomSuffix = Math.random().toString(36).substring(2, 6)
  const newName = `${orig.name} (Copy)`
  const newSlug = `${orig.slug}-copy-${randomSuffix}`

  const newProductPayload = {
    name: newName,
    slug: newSlug,
    category_id: orig.category_id,
    brand_id: orig.brand_id,
    description: orig.description,
    meta_title: orig.meta_title ? `${orig.meta_title} (Copy)` : null,
    meta_description: orig.meta_description,
    is_active: false, // تُنشأ كغير نشطة افتراضياً لمراجعتها
    is_featured: false,
  }

  // 4. إنشاء المنتج الأساسي الجديد
  const { data: duplicatedProduct, error: insertError } = await supabase
    .from("products")
    .insert(newProductPayload)
    .select()
    .single()

  if (insertError || !duplicatedProduct) {
    return {
      success: false,
      error: "DUPLICATE_PRODUCT_ERROR",
      details: {
        database: [insertError?.message || "Failed to insert product"],
      },
    }
  }

  const newProductId = duplicatedProduct.id

  // دالة تراجع في حال حدوث أي خطأ في المتغيرات أو الصور
  const rollback = async () => {
    await supabase.from("products").delete().eq("id", newProductId)
  }

  // خريطة لربط الـ ID القديم للمتغير بالـ ID الجديد لربط الصور بدقة
  const oldVariantIdToNewIdMap = new Map<string, string>()

  // 5. تكرار المتغيرات (Product Variants)
  if (orig.product_variants && orig.product_variants.length > 0) {
    const variantsPayload = orig.product_variants.map((v, idx) => ({
      product_id: newProductId,
      sku: `${v.sku}-COPY-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      name: v.name,
      attributes: v.attributes || {},
      price: v.price,
      compare_at_price: v.compare_at_price,
      stock_quantity: v.stock_quantity,
      track_inventory: v.track_inventory,
      low_stock_threshold: v.low_stock_threshold,
      is_active: v.is_active,
      sort_order: v.sort_order ?? idx + 1,
    }))

    const { data: insertedVariants, error: variantsError } = await supabase
      .from("product_variants")
      .insert(variantsPayload)
      .select("id, sku")

    if (variantsError || !insertedVariants) {
      await rollback()
      return {
        success: false,
        error: "DUPLICATE_VARIANTS_ERROR",
        details: {
          database: [variantsError?.message || "Failed to insert variants"],
        },
      }
    }

    // ربط المعرفات القديمة بالجديدة بترتيب المصفوفة
    orig.product_variants.forEach((v, index) => {
      if (insertedVariants[index]) {
        oldVariantIdToNewIdMap.set(v.id, insertedVariants[index].id)
      }
    })
  }

  // 6. تكرار الصور (Product Images)
  if (orig.product_images && orig.product_images.length > 0) {
    const imagesPayload = orig.product_images.map((img) => ({
      product_id: newProductId,
      variant_id: img.variant_id
        ? oldVariantIdToNewIdMap.get(img.variant_id) || null
        : null,
      url: img.url,
      alt_text: img.alt_text ? `${img.alt_text} (Copy)` : null,
      is_primary: img.is_primary,
      sort_order: img.sort_order ?? 0,
    }))

    const { error: imagesError } = await supabase
      .from("product_images")
      .insert(imagesPayload)

    if (imagesError) {
      await rollback()
      return {
        success: false,
        error: "DUPLICATE_IMAGES_ERROR",
        details: { database: [imagesError.message] },
      }
    }
  }

  revalidatePath("/dashboard/products")

  return {
    success: true,
    data: duplicatedProduct as Product,
  }
}
