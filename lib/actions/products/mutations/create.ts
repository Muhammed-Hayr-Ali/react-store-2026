"use server"

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

export async function createProduct(
  data: CreateProductCompleteInput
): Promise<ApiResult<Product | null>> {
  // 1. التحقق من صحة البيانات
  const validation = createProductCompleteSchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  // 2. التحقق من الصلاحيات
  if (!(await hasRole("admin")) || !(await hasPermission("create_product"))) {
    return { success: false, error: "UNAUTHORIZED_ACCESS" }
  }

  const supabase = await createServerClient()

  // 3. استبعاد variants و images من بيانات المنتج الأساسي
  const { variants, images, ...productOnlyData } = validation.data

  const cleanProductData = {
    ...productOnlyData,
    brand_id: productOnlyData.brand_id || null,
    description: productOnlyData.description || null,
    meta_title: productOnlyData.meta_title || null,
    meta_description: productOnlyData.meta_description || null,
  }

  // 4. إنشاء المنتج الأساسي
  const { data: newProduct, error: productError } = await supabase
    .from("products")
    .insert(cleanProductData)
    .select()
    .single()

  if (productError) {
    if (productError.code === "23505")
      return { success: false, error: "SLUG_ALREADY_EXISTS" }
    return {
      success: false,
      error: productError.message || "CREATE_PRODUCT_ERROR",
      details: { database: [productError.message] },
    }
  }

  const productId = newProduct.id
  let createdVariants: CreatedVariant[] = []

  // 5. إنشاء المتغيرات
  if (variants.length > 0) {
    const variantsPayload = variants.map((v, idx) => ({
      product_id: productId,
      sku: v.sku.trim(),
      name: v.name?.trim() || null,
      attributes:
        v.attributes && Object.keys(v.attributes).length > 0
          ? v.attributes
          : {},
      price: Number(v.price),
      compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null,
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
      console.error("Variants Insert Error:", variantsError)

      // في حال فشل إنشاء المتغيرات، نحذف المنتج الأساسي لتجنب بقاء بيانات معلقة (Rollback يدوي)
      await supabase.from("products").delete().eq("id", productId)

      if (variantsError.code === "23505") {
        return {
          success: false,
          error: "رمز التخزين (SKU) مستخدم بالفعل لمتغير آخر.",
          details: { database: [variantsError.message] },
        }
      }

      return {
        success: false,
        error: `فشل في إنشاء المتغيرات: ${variantsError.message}`,
        details: { database: [variantsError.message] },
      }
    }
    createdVariants = (variantsData || []) as CreatedVariant[]
  }

  // 6. إنشاء الصور وربطها بالمتغيرات عبر SKU
  if (images.length > 0) {
    const imagesPayload = images.map((img) => {
      let targetVariantId: string | null = null

      if (img.variant_sku) {
        const matchedVariant = createdVariants.find(
          (v: CreatedVariant) => v.sku === img.variant_sku
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
      console.error("Images Insert Error:", imagesError)
      return {
        success: false,
        error: `فشل في حفظ الصور: ${imagesError.message}`,
        details: { database: [imagesError.message] },
      }
    }
  }

  return { success: true, data: newProduct as Product }
}
