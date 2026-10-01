import { ProductWithRelations } from "@/lib/actions/products/types"

export type ProductVariantItem =
  ProductWithRelations["product_variants"][number]
export type ProductImageItem =
  ProductWithRelations["product_images"][number] & {
    variant_sku?: string | null
  }

export const formatPrice = (priceInCents: number) => {
  return (priceInCents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const COLOR_MAP: Record<string, string> = {
  red: "#ef4444",
  أحمر: "#ef4444",
  blue: "#3b82f6",
  أزرق: "#3b82f6",
  black: "#171717",
  أسود: "#171717",
  white: "#ffffff",
  أبيض: "#ffffff",
  green: "#22c55e",
  أخضر: "#22c55e",
  yellow: "#eab308",
  أصفر: "#eab308",
  orange: "#f97316",
  برتقالي: "#f97316",
  gray: "#737373",
  رمادي: "#737373",
}

export const getColorHex = (colorValue: string) => {
  const trimmed = colorValue.trim()
  if (trimmed.startsWith("#")) return trimmed
  if (/^[0-9A-Fa-f]{3,8}$/.test(trimmed)) return `#${trimmed}`
  const mapped = COLOR_MAP[trimmed.toLowerCase()]
  return mapped || trimmed
}

export function resolveVariantImage(
  variant: ProductVariantItem | null,
  allVariants: ProductVariantItem[],
  allImages: ProductImageItem[]
): string {
  if (!variant || allImages.length === 0) return ""

  // 1. مطابقة مباشرة عبر variant_id
  const directMatch = allImages.find((img) => img.variant_id === variant.id)
  if (directMatch?.url) return directMatch.url

  // 2. مطابقة عبر variant_sku
  const skuMatch = allImages.find(
    (img) =>
      img.variant_sku &&
      variant.sku &&
      img.variant_sku.trim().toLowerCase() === variant.sku.trim().toLowerCase()
  )
  if (skuMatch?.url) return skuMatch.url

  // 3. Fallback ذكي للون
  const currentColor =
    variant.attributes?.color ||
    variant.attributes?.colour ||
    variant.attributes?.["اللون"]

  if (currentColor) {
    const siblingWithSameColor = allVariants.find(
      (v) =>
        v.id !== variant.id &&
        (v.attributes?.color === currentColor ||
          v.attributes?.colour === currentColor ||
          v.attributes?.["اللون"] === currentColor) &&
        allImages.some((img) => img.variant_id === v.id)
    )

    if (siblingWithSameColor) {
      const siblingImage = allImages.find(
        (img) => img.variant_id === siblingWithSameColor.id
      )
      if (siblingImage?.url) return siblingImage.url
    }
  }

  // 4. استخدام الصورة الأساسية للمنتج أو أول صورة متاحة
  const primaryImg = allImages.find((img) => img.is_primary)
  return primaryImg?.url || allImages[0]?.url || ""
}
