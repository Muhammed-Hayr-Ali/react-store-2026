"use server";

import { createServerClient } from "../supabase/createServerClient";


export async function createProductOptionValue({
  option_id,
  value,
}: {
  option_id: string;
  value: string;
}) {
  try {
        const supabase = await createServerClient();
    const { data: optionValue, error } = await supabase
      .from("product_option_values")
      .insert({
        option_id,
        value: value.trim(),
      })
      .select("id")
      .single();

    if (error?.code === "42501") {
      return {
        success: false,
        error: "You do not have permission to access this resource.",
      };
    }

    if (error) throw error;

    return { success: true, optionValueId: optionValue.id };
  } catch (error) {
    console.error("Error creating product option value:", error);
    return {
      success: false,
      error: "Failed to create product option value",
    };
  }
}
