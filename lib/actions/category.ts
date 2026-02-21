"use server";

import { createServerClient } from "../supabase/createServerClient";

// ===============================================================================
// File Name: category.ts
// Description: Category Management Actions.
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

// ================================================================================
// Category Type
// ================================================================================
export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  created_at: Date;
};

// ===============================================================================
// Category Payload Type
// ===============================================================================
export type CategoryPayload = Omit<Category, "id" | "created_at">;


// ===============================================================================
// Search Category Field Type
// ===============================================================================
export type CategorySearchField = "name" | "slug" | "description";


// ===============================================================================
// Create Category Action
// ===============================================================================
export async function createCategory(
  data: CategoryPayload,
): Promise<ApiResponse<string>> {
  // Create a Supabase client instance for server-side operations
  const supabase = await createServerClient();
  // Insert the new category into the "categories" table and select the inserted record to get the new category ID
  const { data: category, error } = await supabase
    .from("categories")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error inserting category:", error);
    return { error: "Failed to create category" };
  }

  return { data: category.id };
}

// ================================================================================
// Get All Categories Action
// ================================================================================
export async function getAllCategories(): Promise<ApiResponse<Category[]>> {
  // Create a Supabase client instance for server-side operations
  const supabase = await createServerClient();
  // Fetch all categories from the "categories" table, ordered by creation date in descending order
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });
  // Critical error handling: If there's an error fetching categories, we log it and return a user-friendly error message
  if (error) {
    console.error("Error fetching categories:", error);
    return { error: "Failed to fetch categories" };
  }

  return { data: categories };
}


// ================================================================================
// Update Category Action
// ================================================================================
export async function updateCategory(
  id: string,
  data: Partial<CategoryPayload>,
): Promise<ApiResponse<boolean>> {
  // Create a Supabase client instance for server-side operations
  const supabase = await createServerClient();
  // Update the category in the "categories" table with the provided data
  const { error } = await supabase.from("categories").update(data).eq("id", id);
  // Critical error handling: If there's an error updating the category, we log it and return a user-friendly error message
  if (error) {
    console.error("Error updating category:", error);
    return { error: "Failed to update category" };
  }
  // Return a success response with the updated category data
  return { data: true };
}

// ================================================================================
// Delete Category Action
// ================================================================================
export async function deleteCategory(id: string): Promise<ApiResponse<boolean>> {
  // Create a Supabase client instance for server-side operations
  const supabase = await createServerClient();
  // Delete the category from the "categories" table based on the provided ID
  const { error } = await supabase.from("categories").delete().eq("id", id);
  // Critical error handling: If there's an error deleting the category, we log it and return a user-friendly error message
  if (error) {
    console.error("Error deleting category:", error);
    return { error: "Failed to delete category" };
  }
  // Return a success response with the deleted category data
  return { data: true };
}

// ================================================================================
// Search Categories Action
// ================================================================================
export async function searchCategories(
  field: CategorySearchField,
  query: string,
): Promise<ApiResponse<Category[]>> {
  // Critical validation: Ensure we have a valid search query before attempting to search categories
  if (!query || query.trim() === "") {
    return { data: [], error: "Search query cannot be empty." }
  }

  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Search categories for the provided query, using a case-insensitive search on the specified field
  const { data, error } = await supabase.from("categories").select("*").ilike(field, `%${query}%`);
  // Critical error handling: If we fail to search categories, we log the error and return a user-friendly message
  if (error) {
    console.error("Error searching categories:", error.message);
    return { error: "Failed to search categories." }
  }
  // Return the search results in a consistent API response format
  return { data }
}