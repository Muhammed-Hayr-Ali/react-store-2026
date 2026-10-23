/**
 * @file lib/actions/wishlists/index.ts
 * @description Exposes the public wishlist action API.
 */

// Mutations
export { addToWishlist } from "./mutations/add-to-wishlist"
export { removeFromWishlist } from "./mutations/remove-from-wishlist"

// Queries
export { getWishlist } from "./queries/get-wishlist"
export { getWishlistProductIds } from "./queries/get-wishlist-product-ids"

// Types & Schemas
export type { Wishlist, WishlistQueryResult } from "./types"
export { wishlistSchema, type WishlistInput } from "./schemas"