"use server";

import { createServerClient } from "../supabase/createServerClient";


export async function createProductOption({ name }: { name: string }) {
  try {
    const supabase = await createServerClient();
    const { data: option, error } = await supabase
      .from("product_options")
      .insert({ name: name.trim() })
      .select("id")
      .single();

    if (error?.code === "42501") {
      return {
        success: false,
        error: "You do not have permission to access this resource.",
      };
    }

    if (error) throw error;

    return { success: true, optionId: option.id };
  } catch (error) {
    console.error("Error creating product option:", error);
    return { success: false, error: "Failed to create product option" };
  }
}
