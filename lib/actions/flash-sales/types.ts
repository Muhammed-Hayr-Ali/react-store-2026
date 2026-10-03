/**
 * @file lib/actions/flash-sales/types.ts
 * @description Pure TypeScript type definitions and interfaces for the flash sales domain.
 */

import { z } from "zod"
import {
  flashSaleDiscountTypeSchema,
  flashSaleItemSchema,
  flashSaleFormSchema,
} from "./schemas"

// ============================================================================
// Inferred Schema Types
// ============================================================================

export type FlashSaleDiscountType = z.infer<typeof flashSaleDiscountTypeSchema>
export type FlashSaleItemFormInput = z.infer<typeof flashSaleItemSchema>
export type FlashSaleFormInput = z.infer<typeof flashSaleFormSchema>

// ============================================================================
// Entity & Display Types
// ============================================================================

export interface FlashSale {
  id: string
  title: string
  title_ar: string | null
  slug: string
  description: string | null
  starts_at: string
  ends_at: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FlashSaleProductItem {
  id: string
  flash_sale_item_id: string
  name: string
  slug: string
  primary_image_url: string | null
  category_name: string | null
  brand_name: string | null
  original_price: number
  flash_price: number
  discount_percentage: number | null
  discount_type: FlashSaleDiscountType
  discount_value: number | null
  quantity_limit: number | null
  sold_count: number
}

export interface ActiveFlashSale {
  id: string
  title: string
  title_ar: string | null
  slug: string
  description: string | null
  starts_at: string
  ends_at: string
  products: FlashSaleProductItem[]
}

export interface AdminFlashSaleItem extends FlashSale {
  item_count: number
  status: "active" | "scheduled" | "expired" | "disabled"
}

export interface SelectableProduct {
  id: string
  name: string
  slug: string
  price: number
  primary_image_url: string | null
}
