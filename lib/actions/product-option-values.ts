"use server";

import { createServerClient } from "../supabase/createServerClient";

// ===============================================================================
// File Name: product-options-values.ts
// Description: Product Option Value Management Actions.
// Status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-02-21
// Version: 1.0
// Copyright (c) 2026 Mohammed Kher Ali
// ===============================================================================

// ================================================================================
// Api Response Type
// ================================================================================
export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// ===============================================================================
// Product Option Value Type
// ===============================================================================
export type ProductOptionValue = {
  id: string;
  option_id: string;
  value: string;
};

// ===============================================================================
// Create Product Option Value Payload
// ===============================================================================
export type ProductOptionValuePayload = Omit<ProductOptionValue, "id">;

// ===============================================================================
// Product Option Search Field Type
// ===============================================================================
export type ProductOptionValueSearchField = "name";

// ================================================================================
// Create Product Option
// ================================================================================
export async function createProductOptionValue({
  option_id,
  value,
}: {
  option_id: string;
  value: string;
}): Promise<ApiResponse<string>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Insert a new ProductOption into the "product_options" table with the provided data, and select the inserted record to get the new ProductOption ID
  const { data: optionValue, error } = await supabase
    .from("product_option_values")
    .insert({
      option_id,
      value: value.trim(),
    })
    .select("id")
    .single();
  // Critical error handling: If we fail to create the ProductOption, we log the error and return a user-friendly message
  if (error) {
    console.error("Error creating ProductOption:", error);
    return { error: "Failed to create ProductOption." };
  }
  // Return the success status and the new ProductOption ID
  return { data: optionValue.id };
}

// ===============================================================================
// Get All Product Options
// ================================================================================
export async function getProductOptionValues(): Promise<
  ApiResponse<ProductOptionValue[]>
> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch all ProductOptions from the "product_options" table
  const { data: optionValues, error } = await supabase
    .from("product_option_values")
    .select("*");
  // Critical error handling: If we fail to fetch the ProductOptions, we log the error and return a user-friendly message
  if (error) {
    console.error("Error fetching ProductOptions:", error);
    return { error: "Failed to fetch ProductOptions." };
  }
  // Return the success status and the ProductOptions data
  return { data: optionValues };
}

// ================================================================================
// Update Product Option
// ================================================================================
export async function updateProductOptionValue({
  id,
  formData,
}: {
  id: string;
  formData: ProductOptionValuePayload;
}): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Update the ProductOption for the provided ID with the provided data
  const { error } = await supabase
    .from("product_option_values")
    .update(formData)
    .eq("id", id);
  // Critical error handling: If we fail to update the ProductOption, we log the error and return a user-friendly message
  if (error) {
    console.error("Error updating ProductOption:", error);
    return { error: "Failed to update ProductOption." };
  }
  // Return the success status
  return { data: true };
}

// ===============================================================================
// Delete Product Option
// ================================================================================
export async function deleteProductOptionValue(
  id: string,
): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Delete the ProductOption for the provided ID
  const { error } = await supabase
    .from("product_option_values")
    .delete()
    .eq("id", id);
  // Critical error handling: If we fail to delete the ProductOption, we log the error and return a user-friendly message
  if (error) {
    console.error("Error deleting ProductOption:", error);
    return { error: "Failed to delete ProductOption." };
  }
  // Return the success status
  return { data: true };
}

// ===============================================================================
// Get Product Option Value by ID
// ================================================================================
export async function getProductOptionValueById(
  id: string,
): Promise<ApiResponse<ProductOptionValue>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the ProductOptionValue for the provided ID
  const { data: optionValue, error } = await supabase
    .from("product_option_values")
    .select("*")
    .eq("id", id)
    .single();
  // Critical error handling: If we fail to fetch the ProductOptionValue, we log the error and return a user-friendly message
  if (error) {
    console.error("Error fetching ProductOptionValue:", error);
    return { error: "Failed to fetch ProductOptionValue." };
  }
  // Return the success status and the ProductOptionValue data
  return { data: optionValue };
}

// ===============================================================================
// Search Product Option Values by Option ID
// ================================================================================
export async function searchProductOptionValuesByOptionId(
  field: ProductOptionValueSearchField | "address_nickname",
  query: string,
): Promise<ApiResponse<ProductOptionValue[]>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the ProductOptionValue for the provided ID
  const { data: optionValues, error } = await supabase
    .from("product_option_values")
    .select("*")
    .eq(field, query)
    .order("created_at", { ascending: false });
  // Critical error handling: If we fail to fetch the ProductOptionValue, we log the error and return a user-friendly message
  if (error) {
    console.error("Error fetching ProductOptionValue:", error);
    return { error: "Failed to fetch ProductOptionValue." };
  }
  // Return the success status and the ProductOptionValue data
  return { data: optionValues };
}
