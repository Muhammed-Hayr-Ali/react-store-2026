/**
 * @file lib/actions/cart/schemas.ts
 * @description Zod validation schemas for cart actions.
 */

import { z } from "zod"

export const addToCartSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
})

export const updateCartItemSchema = z.object({
  item_id: z.string().uuid(),
  quantity: z.number().int().positive(),
})

export const removeCartItemSchema = z.object({
  item_id: z.string().uuid(),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>