import { z } from "zod"

export const flashSaleDiscountTypeSchema = z.enum([
  "percentage",
  "fixed_amount",
  "fixed_price",
  "none",
])

export const flashSaleItemSchema = z
  .object({
    productId: z.string().uuid({ message: "Invalid product identifier" }),
    productName: z.string().min(1),
    productPrice: z.number().nonnegative(),
    discountType: flashSaleDiscountTypeSchema,
    discountValue: z.number().nullable().optional(),
    quantityLimit: z.number().int().positive().nullable().optional(),
  })
  .refine(
    (item) => {
      if (item.discountType === "none") {
        return true
      }
      return typeof item.discountValue === "number" && item.discountValue >= 0
    },
    {
      message: "Discount value is required when discount type is set",
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
      message: "Percentage discount must be between 1 and 100",
      path: ["discountValue"],
    }
  )

export const flashSaleFormSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(255),
    titleAr: z.string().max(255).optional().nullable(),
    slug: z
      .string()
      .min(3, "Slug must be at least 3 characters")
      .max(255)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase alphanumeric with hyphens"
      ),
    description: z.string().max(1000).optional().nullable(),
    startsAt: z.string().min(1, "Start date and time are required"),
    endsAt: z.string().min(1, "End date and time are required"),
    isActive: z.boolean(),
    items: z
      .array(flashSaleItemSchema)
      .min(1, "Please add at least one product to the flash sale"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startsAt).getTime()
      const end = new Date(data.endsAt).getTime()
      return end > start
    },
    {
      message: "End time must be later than start time",
      path: ["endsAt"],
    }
  )

export type FlashSaleItemFormInput = z.infer<typeof flashSaleItemSchema>
export type FlashSaleFormInput = z.infer<typeof flashSaleFormSchema>
