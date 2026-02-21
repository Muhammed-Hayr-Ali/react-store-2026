"use server";

import { createServerClient } from "../supabase/createServerClient";

// ===============================================================================
// File Name: brands.ts
// Description: Utility function to create a new brand.
// Status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-02-21
// Version: 1.0
// Copyright (c) 2026 Mohammed Kher Ali
// ===============================================================================

// ================================================================================
// Api Response Type
// ================================================================================
export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  [key: string]: unknown;
};

// ===============================================================================
// Brand Type
// ===============================================================================
export type Brand = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  created_at: Date;
};

export type CreateBrandPayload = {
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
};




// ===============================================================================
// Address Search Field Type
// ===============================================================================
export type BrandsSearchField =
  | "name"
  | "slug"
  | "description";




// ============================================================================
// Create Brand Function
// ============================================================================
export async function createBrand(
  data: CreateBrandPayload,
): Promise<ApiResponse<string>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Insert a new brand into the "brands" table with the provided data, and select the inserted record to get the new brand ID
  const { data: brand, error } = await supabase
    .from("brands")
    .insert(data)
    .select("id")
    .single();
  // Critical error handling: If we fail to create the brand, we log the error and return a user-friendly message
  if (error) {
    console.error("Error creating brand:", error);
    return {error: "Failed to create brand." };
  }
  // Return the success status and the new brand ID
  return { data: brand.id };
}


// ============================================================================
// Get Brands Function
// ============================================================================
export async function getBrands(): Promise<ApiResponse<Brand[]>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch all brands from the "brands" table, selecting only the id, name, and slug fields
  const { data: brands, error } = await supabase.from("brands").select("*");
  // Critical error handling: If we fail to fetch brands, we log the error and return a user-friendly message
  if (error) {
    console.error("Error fetching brands:", error);
    return { error: "Failed to fetch brands." };
  }
  // Return the fetched brands
  return { data: brands };
}


// ================================================================================
// Update Brand Function
// ================================================================================
export async function updateBrand(
  brandId: string,
  data: Partial<CreateBrandPayload>,
): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Update the brand in the "brands" table with the provided data
  const { error } = await supabase
    .from("brands")
    .update(data)
    .eq("id", brandId);
  // Critical error handling: If we fail to update the brand, we log the error and return a user-friendly message
  if (error) {
    console.error("Error updating brand:", error);
    return { error: "Failed to update brand." };
  }
  // Return the success status
  return { data: true };
}


// ================================================================================
// Delete Brand Function
// ================================================================================
export async function deleteBrand(
  brandId: string
): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Delete the brand from the "brands" table based on the provided brand ID
  const { error } = await supabase.from("brands").delete().eq("id", brandId);
  // Critical error handling: If we fail to delete the brand, we log the error and return a user-friendly message
  if (error) {
    console.error("Error deleting brand:", error);
    return { error: "Failed to delete brand." };
  }
  // Return the success status
  return { data: true };
}

//================================================================================
// Search Brand
//================================================================================
export async function searchBrand(
  field: BrandsSearchField,
  query: string,
): Promise<ApiResponse<Brand[]>> {
  // Critical validation: Ensure we have a valid search query before attempting to search addresses
  if (!query || query.trim() === "") {
    return { data: [], error: "Search query cannot be empty." };
  }

  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
 

  // Search addresses for the authenticated user based on the provided query, using a case-insensitive search on the street_address field
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .ilike(field, `%${query}%`);

  // Critical error handling: If we fail to search addresses, we log the error and return a user-friendly message
  if (error) {
    console.error("Error searching brands:", error.message);
    return { error: "Failed to search brands." };
  }
  // Return the search results in a consistent API response format
  return { data };
}
