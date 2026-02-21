"use server";

import { createServerClient } from "../supabase/createServerClient";
import { revalidatePath } from "next/cache";
import { getUser } from "./get-user-action";

// ===============================================================================
// File Name: address.ts
// Description: Address Management Actions for the currently authenticated user.
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
// User Address Type
// ================================================================================

export type UserAddress = {
  id: string;
  user_id: string;
  address_nickname: string | null;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  created_at: Date;
  [key: string]: unknown;
};

// ===============================================================================
// Address Payload Type
// ===============================================================================
export type AddressPayload = Omit<UserAddress, "id" | "user_id" | "created_at">;



// ===============================================================================
// Address Search Field Type
// ===============================================================================
export type AddressSearchField =
  | "address_nickname"
  | "first_name"
  | "last_name"
  | "address"
  | "city"
  | "state"
  | "zip"
  | "country";



//================================================================================
// Create Address
//================================================================================
export async function createAddress(
  formData: AddressPayload,
): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with adding a new address
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "Authentication failed." };
  }
  // Add a new address for the authenticated user
  const { error } = await supabase
    .from("user_addresses")
    .insert({ ...formData, user_id: user.id });
  // Critical error handling: If we fail to add the address, we log the error and return a user-friendly message
  if (error) {
    console.error("Error adding address:", error.message);
    return { data: false, error: "Failed to add address." };
  }
  // After a successful addition, we revalidate relevant page paths to ensure the UI reflects the latest data
  revalidatePath("/checkout");
  revalidatePath("/addresses");
  return { data: true };
}

//================================================================================
// Get User Addresses
//================================================================================
export async function getAddresses(): Promise<ApiResponse<UserAddress[]>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "Authentication failed." };
  }
  // Fetch addresses for the authenticated user
  const { data: userAddresses, error: addressesError } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Critical error handling: If we fail to fetch addresses, we log the error and return a user-friendly message
  if (addressesError) {
    console.error("Error fetching user addresses:", addressesError);
    return { error: "Failed to fetch user addresses." };
  }
  // Return the fetched addresses in a consistent API response format
  return { data: userAddresses };
}

//================================================================================
// Update Address
//================================================================================
export async function updateAddress(
  id: string,
  formData: AddressPayload,
): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with updating the address
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "Authentication failed." };
  }
  // Update the address for the authenticated user
  const { error } = await supabase
    .from("user_addresses")
    .update(formData)
    .eq("id", id)
    .eq("user_id", user.id);
  // Critical error handling: If we fail to update the address, we log the error and return a user-friendly message
  if (error) {
    console.error("Error updating address:", error.message);
    return { error: "Failed to update address." };
  }
  // After a successful update, we revalidate relevant page paths to ensure the UI reflects the latest data
  revalidatePath("/checkout");
  revalidatePath("/addresses");
  return { data: true };
}

//================================================================================
// Delete Address
//================================================================================
export async function deleteAddress(
  id: string,
): Promise<ApiResponse<boolean>> {
  // Critical validation: Ensure we have a valid address ID before attempting to delete
  if (!id) {
    return { data: false, error: "Address ID is required." };
  }
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with deleting the address
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "Authentication failed." };
  }
  // Delete the address for the authenticated user, ensuring we match both the address ID and user ID for security
  const { error } = await supabase
    .from("user_addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  // Critical error handling: If we fail to delete the address, we log the error and return a user-friendly message
  if (error) {
    console.error("Error deleting address:", error.message);
    return { data: false, error: "Failed to delete address." };
  }
  // After a successful deletion, we revalidate relevant page paths to ensure the UI reflects the latest data
  revalidatePath("/checkout");
  revalidatePath("/addresses");
  return { data: true };
}



//================================================================================
// Search Address
//================================================================================
export async function searchAddress(
  field: AddressSearchField | "address_nickname",
  query: string,
): Promise<ApiResponse<UserAddress[]>> {
  // Critical validation: Ensure we have a valid search query before attempting to search addresses
  if (!query || query.trim() === "") {
    return { data: [], error: "Search query cannot be empty." };
  }

  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with adding a new address
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "Authentication failed." };
  }

  // Search addresses for the authenticated user based on the provided query, using a case-insensitive search on the street_address field
  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", user.id)
    .ilike(field, `%${query}%`);

  // Critical error handling: If we fail to search addresses, we log the error and return a user-friendly message
  if (error) {
    console.error("Error searching addresses:", error.message);
    return { error: "Failed to search addresses." };
  }
  // Return the search results in a consistent API response format
  return { data };
}



// ================================================================================
// End of File: address.ts
// ================================================================================