"use server";

import { createServerClient } from "../supabase/createServerClient";

export async function createCategory(data: { name: string; slug: string }) {
  try {
    const supabase = await createServerClient();
    const { data: category, error } = await supabase
      .from("categories")
      .insert({
        name: data.name,
        slug: data.slug,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, categoryId: category.id };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "فشل إنشاء التصنيف" };
  }
}
