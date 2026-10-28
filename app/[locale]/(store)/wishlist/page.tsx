/**
 * @file app/[locale]/(store)/wishlist/page.tsx
 * @description User wishlist page displaying saved products with infinite scroll support, matching category and brand page architecture.
 */

import { getWishlist } from "@/lib/actions/wishlists"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import { WishlistProductGrid } from "@/components/wishlist/wishlist-product-grid"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import { notFound } from "next/navigation"

interface WishlistPageProps {
  params: Promise<{ locale: string }>
}

// توليد الميتا داتا ديناميكياً باستخدام مفترس الترجمة الخاص بالـ Wishlist
export async function generateMetadata({ params }: WishlistPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Wishlist" })

  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE", { default: "My Wishlist" }),
    description: t("META_DESCRIPTION", {
      default: "View and manage your saved favorite products.",
    }),
  })
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const userResult = await getCurrentUser()
  if (!userResult.success) {
    return notFound()
  }

  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Wishlist" })
  const errors = await getTranslations({ locale, namespace: "ActionErrors" })

  // 1. جلب الكوكيز لتحديد عرض الشبكة أو القائمة (مطابق تماماً لصفحة التصنيفات)
  const cookieStore = await cookies()
  const viewModeCookie = cookieStore.get("store_product_view_mode")?.value
  const viewMode = (viewModeCookie === "list" ? "list" : "grid") as
    "grid" | "list"

  const PAGE_LIMIT = 12

  // 2. جلب المنتجات الأولية للمفضلة باستخدام دالة getWishlist المدعومة بالصفحات
  const productsResult = await getWishlist({
    limit: PAGE_LIMIT,
    page: 1,
    activeOnly: true,
  })

  if (!productsResult.success) {
    throw new Error(
      errors(getActionErrorKey(productsResult.error ?? "UNEXPECTED_ERROR"))
    )
  }

  const initialProducts = productsResult.success ? productsResult.data : []

  // 3. Server Action للتحميل التلقائي (Infinite Scroll) مطابق تماماً لصفحة التصنيفات
  async function loadMoreProducts(pageNumber: number) {
    "use server"
    const res = await getWishlist({
      limit: PAGE_LIMIT,
      page: pageNumber,
      activeOnly: true,
    })
    return {
      success: res.success,
      data: res.success ? res.data : [],
      hasMore: res.success && res.data ? res.data.length === PAGE_LIMIT : false,
    }
  }

  return (
    <div className="container space-y-8 py-8">
      <WishlistProductGrid
        title={t("PAGE_TITLE", { default: "My Wishlist" })}
        description={t("PAGE_DESC", {
          default: "Explore all your saved favorite products.",
        })}
        viewMode={viewMode}
        initialProducts={initialProducts}
        emptyMessage={t("EMPTY_DESCRIPTION", {
          default: "No products available in your wishlist right now.",
        })}
        fetchMoreAction={loadMoreProducts}
      />
    </div>
  )
}
