/**
 * @file lib/actions/brands/types.ts
 * @description Pure TypeScript type definitions inferred from the Brand validation schemas.
 * Safe for direct import into Client Components without bundling runtime schema logic.
 */

import { z } from "zod"
import { brandSchema, createBrandSchema, updateBrandSchema } from "./schemas"

// ============================================================================
// Entity & Payload Types
// ============================================================================

export type Brand = z.infer<typeof brandSchema>
export type CreateBrand = z.infer<typeof createBrandSchema>
export type UpdateBrand = z.infer<typeof updateBrandSchema>
