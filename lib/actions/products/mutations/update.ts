"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import {
  Product,
  CreateProductCompleteInput,
  createProductCompleteSchema,
  CreatedVariant,
} from "../types"
import { hasRole } from "../../role/role-checker"
import { hasPermission } from "../../role/permission-checker"

export async function updateProduct(
  productId: string,
  data: CreateProductCompleteInput
): Promise<ApiResult<Product | null>> {
  if (!productId) {
    return { success: false, error: "INVALID_PRODUCT_ID" }
  }

  // 1. التحقق من صحة البيانات عبر Zod
  const validation = createProductCompleteSchema.safeParse(data)
  if (!validation.success) {
    console.error(
      "❌ [UpdateProduct] Validation Error:",
      validation.error.flatten().fieldErrors
    )
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  // 2. التحقق من الصلاحيات بالتوازي
  const [isAdmin, canUpdate] = await Promise.all([
    hasRole("admin"),
    hasPermission("create_product"), // أو hasPermission("update_product") بحسب جدول الصلاحيات
  ])

  if (!isAdmin || !canUpdate) {
    console.error(
      "❌ [UpdateProduct] Unauthorized Access: User lacks admin role or permission"
    )
    return { success: false, error: "UNAUTHORIZED_ACCESS" }
  }

  const supabase = await createServerClient()
  const { variants, images, ...productOnlyData } = validation.data

  const cleanProductData = {
    ...productOnlyData,
    slug: productOnlyData.slug.trim().toLowerCase(),
    brand_id: productOnlyData.brand_id || null,
    description: productOnlyData.description || null,
    meta_title: productOnlyData.meta_title || null,
    meta_description: productOnlyData.meta_description || null,
    updated_at: new Date().toISOString(),
  }

  // 3. تحديث السجل في جدول المنتجات
  const { data: updatedProduct, error: productError } = await supabase
    .from("products")
    .update(cleanProductData)
    .eq("id", productId)
    .select()
    .single()

  if (productError) {
    console.error("❌ [UpdateProduct] Product Update Error:", productError)
    if (productError.code === "23505") {
      return { success: false, error: "SLUG_ALREADY_EXISTS" }
    }
    return {
      success: false,
      error: "UPDATE_PRODUCT_ERROR",
      details: { database: [productError.message] },
    }
  }

  // 4. تحديث المتغيرات (Product Variants)
  // لحماية سلامة البيانات: نقوم بحذف المتغيرات السابقة وإعادة إدراجها بالمعرفات والقيم الجديدة
  // (أو يمكن استخدام upsert إذا كنت تحتفظ بـ variant.id)
  const { error: deleteVariantsError } = await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", productId)

  if (deleteVariantsError) {
    console.error(
      "❌ [UpdateProduct] Delete Variants Error:",
      deleteVariantsError
    )
    return {
      success: false,
      error: "UPDATE_VARIANTS_ERROR",
      details: { database: [deleteVariantsError.message] },
    }
  }

  let createdVariants: CreatedVariant[] = []

  if (variants.length > 0) {
    const variantsPayload = variants.map((v, idx) => ({
      product_id: productId,
      sku: v.sku.trim(),
      name: v.name?.trim() || null,
      attributes:
        v.attributes && Object.keys(v.attributes).length > 0
          ? v.attributes
          : {},
      price: Math.round(Number(v.price) * 100),
      compare_at_price: v.compare_at_price
        ? Math.round(Number(v.compare_at_price) * 100)
        : null,
      stock_quantity: Number(v.stock_quantity),
      track_inventory: Boolean(v.track_inventory),
      low_stock_threshold: Number(v.low_stock_threshold),
      is_active: Boolean(v.is_active),
      sort_order: v.sort_order ?? idx + 1,
    }))

    const { data: variantsData, error: variantsError } = await supabase
      .from("product_variants")
      .insert(variantsPayload)
      .select("id, sku")

    if (variantsError) {
      console.error("❌ [UpdateProduct] Variants Insert Error:", variantsError)
      if (variantsError.code === "23505") {
        return { success: false, error: "SKU_ALREADY_EXISTS" }
      }
      return {
        success: false,
        error: "UPDATE_VARIANTS_ERROR",
        details: { database: [variantsError.message] },
      }
    }

    createdVariants = (variantsData || []) as CreatedVariant[]
  }

  // 5. تحديث الصور (Product Images)
  const { error: deleteImagesError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId)

  if (deleteImagesError) {
    console.error("❌ [UpdateProduct] Delete Images Error:", deleteImagesError)
    return {
      success: false,
      error: "UPDATE_IMAGES_ERROR",
      details: { database: [deleteImagesError.message] },
    }
  }

  if (images.length > 0) {
    const imagesPayload = images.map((img) => {
      let targetVariantId: string | null = null

      if (img.variant_sku?.trim()) {
        const cleanSku = img.variant_sku.trim().toLowerCase()
        const matchedVariant = createdVariants.find(
          (v) => v.sku.trim().toLowerCase() === cleanSku
        )
        if (matchedVariant) targetVariantId = matchedVariant.id
      }

      return {
        product_id: productId,
        variant_id: targetVariantId,
        url: img.url.trim(),
        alt_text: img.alt_text?.trim() || null,
        is_primary: Boolean(img.is_primary),
        sort_order: 0,
      }
    })

    const { error: imagesError } = await supabase
      .from("product_images")
      .insert(imagesPayload)

    if (imagesError) {
      console.error("❌ [UpdateProduct] Images Insert Error:", imagesError)
      return {
        success: false,
        error: "UPDATE_IMAGES_ERROR",
        details: { database: [imagesError.message] },
      }
    }
  }

  // إعادة تنشيط كاش الصفحات المتأثرة
  revalidatePath(`/dashboard/products`)
  revalidatePath(`/dashboard/products/${updatedProduct.slug}/edit`)
  revalidatePath(`/product/${updatedProduct.slug}`)

  console.log(
    `✅ [UpdateProduct] Successfully updated product: ${updatedProduct.name} (${updatedProduct.id})`
  )

  return { success: true, data: updatedProduct as Product }
}
