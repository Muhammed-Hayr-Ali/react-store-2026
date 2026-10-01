import { z } from "zod"

export const createReportSchema = z.object({
  targetType: z.enum(["product", "review", "technical_issue", "general"]),
  targetId: z.string().optional(),
  reason: z.string().min(3, "Reason must be at least 3 characters").max(100),
  details: z
    .string()
    .max(1000, "Details cannot exceed 1000 characters")
    .optional(),
})

export type CreateReportInput = z.infer<typeof createReportSchema>
