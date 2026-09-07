"use server"

export type Category = {
  id: string
  parent_id: string | null
  name: string
  name_ar: string | null
  slug: string
  description: string | null
  image_url: string | null
  image_alt: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type CreateCategoryData = Omit<Category, "id" | "created_at" | "updated_at">
export type UpdateCategoryData = Partial<CreateCategoryData>