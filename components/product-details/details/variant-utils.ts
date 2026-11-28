/**
 * @file components/store/product-details/details/variant-utils.ts
 * @description Shared stock, pricing, and attribute-matching helpers for product variants.
 */

import type { ProductVariantDetail } from "@/lib/actions/store/product-details/details/queries/get-product-details"

export function isVariantOutOfStock(variant: ProductVariantDetail): boolean {
  return variant.track_inventory && variant.stock_quantity <= 0
}

export function getDiscountPercentage(
  variant: ProductVariantDetail
): number | null {
  const { price, compare_at_price: compareAt } = variant
  if (compareAt === null || compareAt <= price) return null
  const percentage = Math.round(((compareAt - price) / compareAt) * 100)
  return percentage > 0 ? percentage : null
}

export function getAttribute(
  variant: ProductVariantDetail,
  key: string
): string | null {
  const value = variant.attributes?.[key]
  // لا نستخدم فحص truthy حتى لا تضيع القيم 0 و false
  return value === undefined || value === null || value === ""
    ? null
    : String(value)
}

/**
 * عند اختيار قيمة لخاصية، نختار المتغير الأقرب للاختيار الحالي:
 * المتوفر أولاً، ثم الأكثر تطابقاً في بقية الخصائص.
 */
export function findBestVariant(
  variants: ProductVariantDetail[],
  current: ProductVariantDetail,
  key: string,
  value: string
): ProductVariantDetail | undefined {
  const score = (candidate: ProductVariantDetail) =>
    Object.keys(current.attributes ?? {}).filter(
      (k) =>
        k !== key && getAttribute(candidate, k) === getAttribute(current, k)
    ).length

  return variants
    .filter((v) => getAttribute(v, key) === value)
    .sort(
      (a, b) =>
        Number(isVariantOutOfStock(a)) - Number(isVariantOutOfStock(b)) ||
        score(b) - score(a)
    )[0]
}
