import * as z from "zod"

// role {"role":"admin","permissions":["create_category","update_category","upload_product"]}

export const roleSchema = z.object({
 role: z.string(),
 permissions: z.array(z.string()),
})



export type Role = z.infer<typeof roleSchema>
