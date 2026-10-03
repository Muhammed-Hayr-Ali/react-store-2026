/**
 * @file lib/actions/categories/types.ts
 * @description Pure TypeScript type definitions inferred from Category Zod schemas.
 * Exported for safe client and server usage without importing schema runtime dependencies.
 */

import { z } from "zod"
import {
  categorySchema,
  createCategorySchema,
  updateCategorySchema,
} from "./schemas"

// ============================================================================
// Entity & Payload Types
// ============================================================================

export type Category = z.infer<typeof categorySchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
