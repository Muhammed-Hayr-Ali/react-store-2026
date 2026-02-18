"use server";


import slugify from "slugify";
import { createServerClient } from "../supabase/createServerClient";

export async function createBrand(data: { name: string; slug: string }) {
  try {
    const supabase = await createServerClient();
    const { data: brand, error } = await supabase
      .from("brands")
      .insert({
        name: data.name,
        slug: data.slug,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, brandId: brand.id };
  } catch (error) {
    console.error("Error creating brand:", error);
    return { success: false, error: "فشل إنشاء العلامة التجارية" };
  }
}
