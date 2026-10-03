/**
 * @file lib/actions/flash-sales/schemas.ts
 * @description Zod validation schemas for flash sales and campaign items.
 * Validates discount types, product limits, timing constraints, and URL slugs.
 */

import { z } from "zod"

// ============================================================================
// Discount Types Schema
// ============================================================================

export const flashSaleDiscountTypeSchema = z.enum([
  "percentage",
  "fixed_amount",
  "fixed_price",
  "none",
])

// ============================================================================
// Flash Sale Item Schema
// ============================================================================

export const flashSaleItemSchema = z
  .object({
    productId: z.string().uuid({ message: "INVALID_PRODUCT_ID" }),
    productName: z.string().min(1, "PRODUCT_NAME_REQUIRED"),
    productPrice: z.number().nonnegative("PRICE_MUST_BE_NON_NEGATIVE"),
    discountType: flashSaleDiscountTypeSchema,
    discountValue: z.number().nullable().optional(),
    quantityLimit: z.number().int().positive().nullable().optional(),
  })
  .refine(
    (item) => {
      if (item.discountType === "none") return true
      return typeof item.discountValue === "number" && item.discountValue >= 0
    },
    {
      message: "DISCOUNT_VALUE_REQUIRED",
      path: ["discountValue"],
    }
  )
  .refine(
    (item) => {
      if (
        item.discountType === "percentage" &&
        item.discountValue !== null &&
        item.discountValue !== undefined
      ) {
        return item.discountValue > 0 && item.discountValue <= 100
      }
      return true
    },
    {
      message: "PERCENTAGE_DISCOUNT_OUT_OF_RANGE",
      path: ["discountValue"],
    }
  )

// ============================================================================
// Flash Sale Form Schema
// ============================================================================

export const flashSaleFormSchema = z
  .object({
    title: z.string().min(3, "TITLE_TOO_SHORT").max(255, "TITLE_TOO_LONG"),
    titleAr: z.string().max(255, "TITLE_AR_TOO_LONG").optional().nullable(),
    slug: z
      .string()
      .min(3, "SLUG_TOO_SHORT")
      .max(255, "SLUG_TOO_LONG")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "SLUG_INVALID_FORMAT"),
    description: z
      .string()
      .max(1000, "DESCRIPTION_TOO_LONG")
      .optional()
      .nullable(),
    startsAt: z.string().min(1, "STARTS_AT_REQUIRED"),
    endsAt: z.string().min(1, "ENDS_AT_REQUIRED"),
    isActive: z.boolean(),
    items: z.array(flashSaleItemSchema).min(1, "AT_LEAST_ONE_PRODUCT_REQUIRED"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startsAt).getTime()
      const end = new Date(data.endsAt).getTime()
      return end > start
    },
    {
      message: "END_DATE_MUST_BE_AFTER_START_DATE",
      path: ["endsAt"],
    }
  )
