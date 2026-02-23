"use server";

import { createServerClient } from "../supabase/createServerClient";

// ===============================================================================
// File Name: product-options.ts
// Description: Product Option Management Actions.
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
// Product Option Type
// ===============================================================================
export type ProductOption = {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
};

// ===============================================================================
// Create Product Option Payload
// ===============================================================================
export type ProductOptionPayload = Omit<ProductOption, "id" | "created_at">;

// ===============================================================================
// Product Option Search Field Type
// ===============================================================================
export type AddressSearchField = "name" | "description";
// ================================================================================
// Create Product Option
// ================================================================================
export async function createProductOption(
  props: ProductOptionPayload,
): Promise<ApiResponse<string>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();

  //  Insert a new ProductOption into the "product_options" table with the provided data, and select the inserted record to get the new ProductOption ID
  const { data: productOption, error } = await supabase
    .from("product_options")
    .insert(props)
    .select("id")
    .single();
  // Critical error handling: If we fail to create the ProductOption, we log the error and return a user-friendly message
  if (error) {
    console.error("Error creating ProductOption:", error);
    return { error: "Failed to create ProductOption." };
  }
  // Return the success status and the new ProductOption ID
  return { data: productOption.id };
}

//================================================================================
// Get User Product Options
//================================================================================
export async function getProductOptions(): Promise<
  ApiResponse<ProductOption[]>
> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch all ProductOptions from the "product_options" table
  const { data: productOptions, error } = await supabase
    .from("product_options")
    .select("*");
  // Critical error handling: If we fail to fetch ProductOptions, we log the error and return a user-friendly message
  if (error) {
    console.error("Error fetching ProductOptions:", error);
    return { error: "Failed to fetch ProductOptions." };
  }
  // Return the fetched ProductOptions in a consistent API response format
  return { data: productOptions };
}

//================================================================================
// Update Product Option
//================================================================================
export async function updateProductOption(
  id: string,
  formData: ProductOptionPayload,
): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Update the ProductOption for the provided ID with the provided data
  const { error } = await supabase
    .from("product_options")
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

//================================================================================
// Delete Product Option
//================================================================================
export async function deleteProductOption(
  id: string,
): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Delete the ProductOption for the provided ID
  const { error } = await supabase
    .from("product_options")
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


//================================================================================
// Search Product Option
//================================================================================
export async function searchProductOptions(
  searchField: AddressSearchField,
  searchValue: string,
): Promise<ApiResponse<ProductOption[]>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Search for ProductOptions based on the provided search field and value
  const { data: productOptions, error } = await supabase
    .from("product_options")
    .select("*")
    .ilike(searchField, `%${searchValue}%`);
  // Critical error handling: If we fail to search for ProductOptions, we log the error and return a user-friendly message
  if (error) {
    console.error("Error searching for ProductOptions:", error);
    return { error: "Failed to search for ProductOptions." };
  }
  // Return the found ProductOptions in a consistent API response format
  return { data: productOptions };
}
