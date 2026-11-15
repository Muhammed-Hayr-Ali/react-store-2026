/**
 * @file app/[locale]/(store)/brands/[slug]/page.tsx
 * @description Brand storefront page displaying filtered products with infinite scroll support and dynamic metadata.
 */

import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { APP_CONFIG, COOKIES_KEYS, PRODUCT_MODE } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getFilteredProducts } from "@/lib/actions/store/queries/get_filtered_products"
import BrandClientWrapper from "@/components/store/client-wrapper/brand-client-wrapper"
import { getBrandByFilter } from "@/lib/actions/store/queries/get_brand_by_filter"

interface PageProps {
  params: Promise<{ slug: string; locale: string }>
}

// دالة لتوليد الميتا داتا ديناميكياً استناداً إلى اسم البراند واللغة
export async function generateMetadata({ params }: PageProps) {
  const { slug, locale } = await params

  const result = await getBrandByFilter({ brandSlug: slug })

  let name
  let description

  if (result.success && result.data) {
    const brand = result.data

    name = locale === "ar" ? brand.name_ar || brand.name : brand.name

    description =
      locale === "ar"
        ? brand.description_ar || brand.description || "الوصف غير متوفر"
        : brand.description || "Description not available"
  }

  return createMetadata({
    siteName: APP_CONFIG.NAME,
    title: name ?? "unknown",
    description: description ?? "unknown",
  })
}

export default async function Page({ params }: PageProps) {
  const { slug, locale } = await params

  const result = await getBrandByFilter({ brandSlug: slug })

  if (!result.success || !result.data) {
    return notFound()
  }

  const brand = result.data

  // استخدام Fallback (إذا لم تتوفر الترجمة العربية، يعرض النص الأصلي)
  const name = locale === "ar" ? brand.name_ar || brand.name : brand.name

  const description =
    locale === "ar"
        ? brand.description_ar || brand.description || "الوصف غير متوفر"
        : brand.description || "Description not available"

  const brandId = result.data.id

  // 2. جلب الكوكيز لتحديد طريقة عرض الشبكة أو القائمة
  const cookieStore = await cookies()
  const viewModeCookie = cookieStore.get(COOKIES_KEYS.PRODUCT_MODE)?.value

  const viewMode =
    viewModeCookie === PRODUCT_MODE.LIST ? PRODUCT_MODE.LIST : PRODUCT_MODE.GRID

  const QUERY = brandId
  const PAGE_LIMIT = 12
  const PAGE_NUMBER = 1
  const ACTIVE_ONLY = true

  // 3. جلب المنتجات الأولية للعلامة التجارية
  const productsResult = await getFilteredProducts({
    brandId: QUERY,
    limit: PAGE_LIMIT,
    page: PAGE_NUMBER,
    activeOnly: ACTIVE_ONLY,
  })

  const initialProducts = productsResult.success ? productsResult.data : []

  return (
    <BrandClientWrapper
      id={brandId}
      name={name}
      description={description}
      initialProducts={initialProducts}
      viewMode={viewMode}
    />
  )
}
