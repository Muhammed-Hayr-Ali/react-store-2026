/**
 * @file lib/actions/wishlists/types.ts
 * @description Strict TypeScript types and interfaces for the Wishlist feature.
 */

import type { FullProductDetails } from "@/lib/actions/store/product-details/details/queries/get-product-details"

export interface Wishlist {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

export interface WishlistQueryResult extends Wishlist {
  products: FullProductDetails | null
}