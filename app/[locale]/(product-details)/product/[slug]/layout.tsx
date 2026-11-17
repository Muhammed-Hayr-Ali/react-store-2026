/**
 * @file app/[locale]/(product-details)/product/[slug]/layout.tsx
 * @description Dedicated layout for product details with simplified header and sticky bottom cart bar.
 */

import * as React from "react"

interface ProductDetailsLayoutProps {
  children: React.ReactNode
}

export default function ProductDetailsLayout({
  children,
}: ProductDetailsLayoutProps) {
  return children
}
