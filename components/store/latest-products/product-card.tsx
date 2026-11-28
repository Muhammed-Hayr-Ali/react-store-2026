/**
 * @file components/store/home/latest-products/product-card.tsx
 * @description Product card with image, stock/discount badges, localized brand, rating and price. The whole card links to the product page.
 */

import Image from "next/image"
import Link from "next/link"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { ImageIcon, StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { SimpliProduct } from "@/lib/actions/store/queries/get_filtered_products"

/** رمز عملة المتجر (ISO 4217). عدّله حسب عملة الأسعار المخزنة */
const STORE_CURRENCY = "USD"

interface ProductCardProps {
  product: SimpliProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("LatestProducts")
  const locale = useLocale()
  const format = useFormatter()

  const productHref = `/product/${product.slug}`
  const isArabic = locale.startsWith("ar")

  // الماركة أولاً ثم التصنيف، مع الرجوع للاسم الأساسي إن غاب العربي
  const brandName = (isArabic && product.brandNameAr) || product.brandName
  const categoryName =
    (isArabic && product.categoryNameAr) || product.categoryName
  const eyebrow = brandName || categoryName

  const { price, compareAtPrice, inStock } = product
  const hasDiscount =
    price != null && compareAtPrice != null && compareAtPrice > price
  const discountPercent = hasDiscount
    ? Math.round((1 - price / compareAtPrice) * 100)
    : 0

  const formatPrice = (value: number) =>
    format.number(value, { style: "currency", currency: STORE_CURRENCY })

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow focus-within:ring-2 focus-within:ring-ring hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.imageAlt || product.name}
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 768px) 25vw, 50vw"
            className={cn(
              "object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none",
              !inStock && "opacity-50 grayscale"
            )}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/40">
            <ImageIcon aria-hidden="true" className="size-10" />
          </div>
        )}

        {/* شارة واحدة: نفاد المخزون أهم من الخصم */}
        {!inStock ? (
          <span className="absolute start-2 top-2 rounded-full border border-border bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground">
            {t("OUT_OF_STOCK_BADGE")}
          </span>
        ) : discountPercent > 0 ? (
          <span className="absolute start-2 top-2 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-semibold text-white">
            {t("DISCOUNT_BADGE", {
              percent: format.number(discountPercent / 100, {
                style: "percent",
              }),
            })}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        {eyebrow && (
          <p className="truncate text-xs text-muted-foreground">{eyebrow}</p>
        )}

        <h3 className="line-clamp-2 min-h-10 text-sm leading-5 font-medium text-foreground">
          {/* after يمدّ مساحة النقر لتشمل البطاقة كلها */}
          <Link
            href={productHref}
            className="outline-none after:absolute after:inset-0 after:z-10"
          >
            <bdi>{product.name}</bdi>
          </Link>
        </h3>

        {/* ارتفاع ثابت حتى تتحاذى الأسعار بين البطاقات */}
        <div className="flex h-4 items-center gap-1 text-xs text-muted-foreground">
          {product.reviewCount > 0 && (
            <>
              <StarIcon
                aria-hidden="true"
                className="size-3.5 fill-amber-400 text-amber-400"
              />
              <span aria-hidden="true" className="tabular-nums">
                <span className="font-medium text-foreground">
                  {format.number(product.rating, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                </span>{" "}
                ({format.number(product.reviewCount)})
              </span>
              <span className="sr-only">
                {t("RATING_SUMMARY", {
                  rating: product.rating,
                  count: product.reviewCount,
                })}
              </span>
            </>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
          {price == null ? (
            <span className="text-sm text-muted-foreground">
              {t("PRICE_UNAVAILABLE")}
            </span>
          ) : (
            <>
              <span className="text-base font-bold text-foreground tabular-nums">
                <span className="sr-only">{t("CURRENT_PRICE_LABEL")} </span>
                <bdi>{formatPrice(price)}</bdi>
              </span>
              {hasDiscount && (
                <del className="text-xs text-muted-foreground tabular-nums">
                  <span className="sr-only">{t("OLD_PRICE_LABEL")} </span>
                  <bdi>{formatPrice(compareAtPrice)}</bdi>
                </del>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  )
}
