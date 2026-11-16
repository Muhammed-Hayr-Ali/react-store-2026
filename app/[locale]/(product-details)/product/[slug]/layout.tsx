/**
 * @file app/[locale]/(product-details)/product/[slug]/layout.tsx
 * @description Dedicated layout for product details with simplified header and sticky bottom cart bar.
 */

import * as React from "react"
import { ProductNavbar } from "@/components/store/product/product-navbar"
import { BottomCartBar } from "@/components/store/product/bottom-cart-bar"

interface ProductDetailsLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string; id: string }>
}

export default async function ProductDetailsLayout({
  children,
  params,
}: ProductDetailsLayoutProps) {
  const { locale } = await params
  const isRtl = ["ar", "fa", "ur", "he"].includes(locale)

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
      {/* Simplified Header for Product Details */}
      <ProductNavbar productName="Product Details" isRtl={isRtl} />

      {/* Scrollable Content Container */}
      <main className="min-h-0 min-w-0 w-full flex-1 overflow-y-auto overscroll-y-contain pb-24 md:pb-12">
        <div className="mx-auto w-full max-w-4xl px-4 py-4 md:px-6 md:py-8">
          {children}
        </div>
      </main>

      {/* Sticky Bottom Cart Bar for mobile and quick purchase */}
      <BottomCartBar price={0} onAddToCart={() => {}} />
    </div>
  )
}