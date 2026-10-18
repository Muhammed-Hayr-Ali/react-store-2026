"use server"

/**
 * @file lib/actions/products/create.ts
 * @description Server action for creating a new product with its variants and images.
 * Ensures atomicity (All-or-Nothing) using cascading rollbacks if any step fails.
 */

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { createProductSchema, type CreateProductInput } from "../schemas"
import type { ProductWithRelations } from "../types"

export type CreateProductResult =
  | { success: true; data: ProductWithRelations }
  | { success: false; error: string }

export async function createProduct(
  input: CreateProductInput
): Promise<CreateProductResult> {
  try {
    // 1. التحقق من الصلاحيات
    const canCreate = await hasPermission(PERMISSIONS.CREATE_PRODUCT)
    if (!canCreate) {
      return { success: false, error: "PERMISSION_DENIED" }
    }

    // 2. التحقق من صحة البيانات (Zod Validation)
    const validation = createProductSchema.safeParse(input)
    if (!validation.success) {
      return { success: false, error: "VALIDATION_ERROR" }
    }

    const { variants, images, ...productData } = validation.data
    const supabase = await createServerClient()

    // 3. التحقق من عدم تكرار الـ Slug
    const { count: slugCount, error: slugError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("slug", productData.slug)

    if (slugError) {
      return { success: false, error: "DATABASE_ERROR" }
    }

    if (slugCount && slugCount > 0) {
      return { success: false, error: "PRODUCT_SLUG_ALREADY_EXISTS" }
    }

    // 4. إدخال المنتج الأساسي
    const { data: newProduct, error: productInsertError } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single()

    if (productInsertError || !newProduct) {
      return { success: false, error: "CREATE_PRODUCT_FAILED" }
    }

    // 5. إدخال المتغيرات (Variants) وتطبيق الحذف التلقائي في حال الفشل
    const variantsToInsert = variants.map((variant) => ({
      ...variant,
      product_id: newProduct.id,
    }))

    const { error: variantsError } = await supabase
      .from("product_variants")
      .insert(variantsToInsert)

    if (variantsError) {
      // عملية تراجع (Rollback): نحذف المنتج، وقاعدة البيانات ستحذف كل متعلقاته بفضل CASCADE
      await supabase.from("products").delete().eq("id", newProduct.id)
      return { success: false, error: "CREATE_VARIANTS_FAILED" }
    }

    // 6. إدخال الصور (Images) وتطبيق الحذف التلقائي في حال الفشل
    const imagesToInsert = images.map((img, index) => ({
      ...img,
      product_id: newProduct.id,
      sort_order: index, // لضمان الترتيب كما جاء من الواجهة
    }))

    const { error: imagesError } = await supabase
      .from("product_images")
      .insert(imagesToInsert)

    if (imagesError) {
      // عملية تراجع (Rollback)
      await supabase.from("products").delete().eq("id", newProduct.id)
      return { success: false, error: "CREATE_IMAGES_FAILED" }
    }

    // 7. جلب المنتج النهائي مع علاقاته لإرجاعه للواجهة
    const { data: finalProduct, error: fetchError } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(id, name, name_ar, slug, parent_id),
        brand:brands(id, name, name_ar, slug, logo_url),
        product_variants(*),
        product_images(*)
      `)
      .eq("id", newProduct.id)
      .single()

    if (fetchError || !finalProduct) {
      return { success: false, error: "FETCH_CREATED_PRODUCT_FAILED" }
    }

    // تحديث الكاش (Revalidation) للصفحات المتأثرة
    revalidatePath("/dashboard/products")
    revalidatePath("/products")

    return {
      success: true,
      data: finalProduct as unknown as ProductWithRelations,
    }
  } catch (error) {
    console.error("[createProduct] Unexpected error:", error)
    return { success: false, error: "UNEXPECTED_ERROR" }
  }
}