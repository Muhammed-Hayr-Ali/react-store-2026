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
  // 1. التحقق من صحة البيانات عبر Zod
  const validation = createProductCompleteSchema.safeParse(data)
  if (!validation.success) {
    console.error(
      "❌ [CreateProduct] Validation Error:",
      validation.error.flatten().fieldErrors
    )
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  // 2. التحقق من الصلاحيات بالتوازي
  const [isAdmin, canCreate] = await Promise.all([
    hasRole("admin"),
    hasPermission("create_product"),
  ])

  if (!isAdmin || !canCreate) {
    console.error(
      "❌ [CreateProduct] Unauthorized Access: User lacks admin role or create_product permission"
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
  }

  // 3. إنشاء المنتج الأساسي
  const { data: newProduct, error: productError } = await supabase
    .from("products")
    .insert(cleanProductData)
    .select()
    .single()

  if (productError) {
    console.error("❌ [CreateProduct] Product Insert Error:", {
      message: productError.message,
      code: productError.code,
      details: productError.details,
      hint: productError.hint,
      cleanProductData,
    })

    if (productError.code === "23505") {
      return { success: false, error: "SLUG_ALREADY_EXISTS" }
    }
    return {
      success: false,
      error: "CREATE_PRODUCT_ERROR",
      details: { database: [productError.message] },
    }
  }

  const productId = newProduct.id

  const rollbackAll = async () => {
    console.warn(
      `⚠️ [CreateProduct] Rolling back product creation (ID: ${productId})...`
    )
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
    if (deleteError) {
      console.error("❌ [CreateProduct] Rollback failed:", deleteError)
    }
  }

  let createdVariants: CreatedVariant[] = []

  // 4. إنشاء المتغيرات
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
      console.error("❌ [CreateProduct] Variants Insert Error:", {
        message: variantsError.message,
        code: variantsError.code,
        details: variantsError.details,
        hint: variantsError.hint,
        variantsPayload,
      })

      await rollbackAll()

      if (variantsError.code === "23505") {
        return { success: false, error: "SKU_ALREADY_EXISTS" }
      }

      return {
        success: false,
        error: "CREATE_VARIANTS_ERROR",
        details: { database: [variantsError.message] },
      }
    }

    createdVariants = (variantsData || []) as CreatedVariant[]
  }

  // 5. إنشاء الصور
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
      console.error("❌ [CreateProduct] Images Insert Error:", {
        message: imagesError.message,
        code: imagesError.code,
        details: imagesError.details,
        hint: imagesError.hint,
        imagesPayload,
      })

      await rollbackAll()

      return {
        success: false,
        error: "CREATE_IMAGES_ERROR",
        details: { database: [imagesError.message] },
      }
    }
  }

  console.log(
    `✅ [CreateProduct] Successfully created product: ${newProduct.name} (${newProduct.id})`
  )
  return { success: true, data: newProduct as Product }
}
