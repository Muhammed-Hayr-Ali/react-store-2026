/**
 * @file lib/actions/wishlists/schemas.ts
 * @description Zod validation schemas for wishlist inputs.
 */

import { z } from "zod"

export const wishlistSchema = z.object({
  product_id: z.string().uuid({ message: "INVALID_PRODUCT_ID" }),
})

export type WishlistInput = z.infer<typeof wishlistSchema>