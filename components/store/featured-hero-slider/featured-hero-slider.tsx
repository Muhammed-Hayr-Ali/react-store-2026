/**
 * @file components/store/featured-hero-slider/featured-hero-slider.tsx
 * @description Server Component يجلب المنتجات المميزة وسعر الصرف ويعرض سلايدر الواجهة الرئيسية.
 */

import { getFilteredProducts } from "@/lib/actions/store/queries/get_filtered_products"
 import { FeaturedHeroSliderClient } from "./featured-hero-slider-client"
import { getStoreExchangeRate } from "@/lib/actions/store/queries/get-exchange-rate"

const FEATURED_LIMIT = 8
const PAGE_NUMBER = 1
const ACTIVE_ONLY = true
const FEATURED_PRODUCTS = true

export default async function FeaturedHeroSlider() {
  const [productsResult, exchangeRate] = await Promise.all([
    getFilteredProducts({
      limit: FEATURED_LIMIT,
      page: PAGE_NUMBER,
      activeOnly: ACTIVE_ONLY,
      is_featured: FEATURED_PRODUCTS,
    }),
    getStoreExchangeRate(),
  ])

  const slides = productsResult.success ? productsResult.data : []

  if (slides.length === 0) return null

  return (
    <FeaturedHeroSliderClient slides={slides} exchangeRate={exchangeRate} />
  )
}