/**
 * @file app/[locale]/(store)/wishlist/page.tsx
 * @description User wishlist page displaying saved products with infinite scroll support, matching category and brand page architecture.
 */

import { getActionErrorKey } from "@/lib/actions/error-keys"
import { APP_CONFIG, COOKIES_KEYS, PRODUCT_MODE } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import { WishlistProductGrid } from "@/components/wishlist/wishlist-product-grid"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import { getWishlistProducts } from "@/lib/actions/wishlists"
import { APP_ROUTES } from "@/lib/config/app-routes"
import { redirect } from "next/navigation"
import EmptyWishlist from "@/components/wishlist/empty-wishlist"
import ErrorWishlist from "@/components/wishlist/error-wishlist"
import { ProductGrid } from "@/components/shared/products-view/product-grid"
import { SimpliProduct } from "@/components/shared/products-view/product-card"

// توليد الميتا داتا ديناميكياً باستخدام مفترس الترجمة الخاص بالـ Wishlist
export async function generateMetadata() {
  const t = await getTranslations("Wishlist")

  return createMetadata({
    siteName: APP_CONFIG.NAME,
    title: t("META_TITLE", { default: "My Wishlist" }),
    description: t("META_DESCRIPTION", {
      default: "View and manage your saved favorite products.",
    }),
  })
}

export default async function WishlistPage() {
  const t = await getTranslations("Wishlist")

  const userResult = await getCurrentUser()
  if (!userResult.success) {
    redirect(APP_ROUTES.AUTH.LOGIN)
  }

  // 1. جلب الكوكيز لتحديد عرض الشبكة أو القائمة (مطابق تماماً لصفحة التصنيفات)
  const cookieStore = await cookies()
  const viewModeCookie = cookieStore.get(COOKIES_KEYS.VIEW_MODE)?.value
  const viewMode =
    viewModeCookie === PRODUCT_MODE.LIST ? PRODUCT_MODE.LIST : PRODUCT_MODE.GRID

  // 2. جلب المنتجات الأولية للمفضلة باستخدام دالة getWishlist المدعومة بالصفحات
  const result = await getWishlistProducts()

  let initialProducts = [] as SimpliProduct[]

  if (result.success) {
    initialProducts = result.data
  }

  return (
    <ProductGrid
      title={t("PAGE_TITLE")}
      viewMode={viewMode}
      hasError={!result.success}
      initialProducts={initialProducts}
      showHeartButton
      className="py-6   px-4 sm:px-6 lg:px-8"
    />
  )
}
