import { createServerClient } from "@/lib/database/supabase/server"
import {
  ActiveFlashSale,
  FlashSaleDiscountType,
  FlashSaleProductItem,
} from "../types"

interface RawProductImage {
  id: string
  url: string | null
  is_primary: boolean | null
  sort_order: number | null
}

interface RawProductVariant {
  id: string
  price: number | null
  is_active: boolean | null
}

interface RawProductData {
  id: string
  name: string
  slug: string
  category?: { name: string; name_ar?: string | null } | null
  brand?: { name: string; name_ar?: string | null } | null
  product_images?: RawProductImage[] | null
  product_variants?: RawProductVariant[] | null
}

interface RawFlashSaleItem {
  id: string
  product_id: string
  discount_type: FlashSaleDiscountType
  discount_value: number | null
  quantity_limit: number | null
  sold_count: number
  products: RawProductData | null
}

interface RawFlashSaleResponse {
  id: string
  title: string
  title_ar: string | null
  slug: string
  description: string | null
  starts_at: string
  ends_at: string
  flash_sale_items: RawFlashSaleItem[]
}

function calculateFlashDiscount(
  basePrice: number,
  discountType: FlashSaleDiscountType,
  discountValue: number | null
): { flashPrice: number; discountPercentage: number | null } {
  if (discountType === "none" || discountValue === null || discountValue <= 0) {
    return { flashPrice: basePrice, discountPercentage: null }
  }

  let calculatedPrice = basePrice
  let percentage: number | null = null

  switch (discountType) {
    case "percentage": {
      const discount = (basePrice * discountValue) / 100
      calculatedPrice = Math.max(0, basePrice - discount)
      percentage = Math.round(discountValue)
      break
    }
    case "fixed_amount": {
      calculatedPrice = Math.max(0, basePrice - discountValue)
      percentage =
        basePrice > 0
          ? Math.round(((basePrice - calculatedPrice) / basePrice) * 100)
          : null
      break
    }
    case "fixed_price": {
      calculatedPrice = Math.max(0, discountValue)
      percentage =
        basePrice > calculatedPrice
          ? Math.round(((basePrice - calculatedPrice) / basePrice) * 100)
          : null
      break
    }
  }

  return {
    flashPrice: Number(calculatedPrice.toFixed(2)),
    discountPercentage: percentage,
  }
}

export async function getActiveFlashSale(): Promise<ActiveFlashSale | null> {
  const supabase = await createServerClient()
  const currentTime = new Date().toISOString()

  const { data, error } = await supabase
    .from("flash_sales")
    .select(
      `
      id,
      title,
      title_ar,
      slug,
      description,
      starts_at,
      ends_at,
      flash_sale_items (
        id,
        product_id,
        discount_type,
        discount_value,
        quantity_limit,
        sold_count,
        products (
          id,
          name,
          slug,
          category:categories (name, name_ar),
          brand:brands (name, name_ar),
          product_images (
            id,
            url,
            is_primary,
            sort_order
          ),
          product_variants (
            id,
            price,
            is_active
          )
        )
      )
    `
    )
    .eq("is_active", true)
    .lte("starts_at", currentTime)
    .gte("ends_at", currentTime)
    .order("ends_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    if (error) {
      console.error("Error fetching active flash sale:", error.message)
    }
    return null
  }

  const rawSale = data as unknown as RawFlashSaleResponse
  const processedProducts: FlashSaleProductItem[] = []

  for (const item of rawSale.flash_sale_items) {
    if (!item.products) continue

    const product = item.products

    // استخراج الصورة: تفضيل الصورة الأساسية is_primary أو الأولى حسب الترتيب
    let primaryImageUrl: string | null = null
    if (product.product_images && product.product_images.length > 0) {
      const primaryImg =
        product.product_images.find((img) => img.is_primary) ||
        [...product.product_images].sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        )[0]
      primaryImageUrl = primaryImg?.url ?? null
    }

    // استخراج السعر الأساسي: أقل سعر من بين المتغيرات النشطة
    let basePrice = 0
    if (product.product_variants && product.product_variants.length > 0) {
      const activePrices = product.product_variants
        .filter((v) => v.is_active !== false && typeof v.price === "number")
        .map((v) => v.price as number)

      if (activePrices.length > 0) {
        basePrice = Math.min(...activePrices)
      }
    }

    const { flashPrice, discountPercentage } = calculateFlashDiscount(
      basePrice,
      item.discount_type,
      item.discount_value
    )

    processedProducts.push({
      id: product.id,
      flash_sale_item_id: item.id,
      name: product.name,
      slug: product.slug,
      primary_image_url: primaryImageUrl,
      category_name: product.category?.name ?? null,
      brand_name: product.brand?.name ?? null,
      original_price: basePrice,
      flash_price: flashPrice,
      discount_percentage: discountPercentage,
      discount_type: item.discount_type,
      discount_value: item.discount_value,
      quantity_limit: item.quantity_limit,
      sold_count: item.sold_count,
    })
  }

  return {
    id: rawSale.id,
    title: rawSale.title,
    title_ar: rawSale.title_ar,
    slug: rawSale.slug,
    description: rawSale.description,
    starts_at: rawSale.starts_at,
    ends_at: rawSale.ends_at,
    products: processedProducts,
  }
}
