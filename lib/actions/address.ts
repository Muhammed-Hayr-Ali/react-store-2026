"use server";

import { createServerClient } from "../supabase/createServerClient";
import { revalidatePath } from "next/cache";
import { getUser } from "./get-user-action";
import { ApiResponse, UserAddress } from "../types";

// ===============================================================================
// File Name: address.ts
// Description: Address Management Actions for the currently authenticated user.
// Status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-02-10
// Version: 1.0
// Copyright (c) 2026 Mohammed Kher Ali
// ===============================================================================

// ===============================================================================
// Address Payload Type
// ===============================================================================
export type AddressPayload = Omit<UserAddress, "id" | "user_id" | "created_at">;

//================================================================================
// Get User Addresses
//================================================================================
/**
 * Fetches all addresses associated with the currently authenticated user.
 * It first authenticates the user, then queries the 'user_addresses' table
 * for all records matching the user's ID, ordered by creation date descending.
 * @returns {Promise<ApiResponse<UserAddress[] | []>>} A promise that resolves to an object
 * containing the user's addresses or an error message.
 */
export async function getUserAddresses(): Promise<
  ApiResponse<UserAddress[] | []>
> {
  const supabase = await createServerClient();
  const { data: user, error: userError } = await getUser();

  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "Authentication failed." };
  }

  const { data: userAddresses, error: addressesError } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (addressesError) {
    console.error("Error fetching user addresses:", addressesError);
    return { error: addressesError.message };
  }

  return { data: userAddresses };
}

//================================================================================
// Update User Address
//================================================================================
/**
 * Updates a specific address for the currently authenticated user.
 * It ensures that the address being updated belongs to the user by matching
 * both the address ID and the user ID in the `update` query.
 * After a successful update, it revalidates relevant page paths.
 * @param {string} addressId - The ID of the address to update.
 * @param {AddressPayload} formData - An object containing the new address data.
 * @returns {Promise<ApiResponse<boolean>>} A promise that resolves to an object
 * indicating success (true) or failure, along with an error message.
 */
export async function updateAddress(
  addressId: string,
  formData: AddressPayload,
): Promise<ApiResponse<boolean>> {
  const supabase = await createServerClient();
  const { data: user, error: userError } = await getUser();

  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "Authentication failed." };
  }

  const { error } = await supabase
    .from("user_addresses")
    .update(formData)
    .eq("id", addressId)
    .eq("user_id", user.id); // Security check: user can only update their own address

  if (error) {
    console.error("Error updating address:", error.message);
    return { data: false, error: "Failed to update address." };
  }

  revalidatePath("/checkout");
  revalidatePath("/addresses");
  return { data: true };
}

//================================================================================
// Add User Address
//================================================================================
/**
 * Adds a new address for the currently authenticated user.
 * It retrieves the user's session, then inserts a new record into the
 * 'user_addresses' table, automatically associating it with the user's ID.
 * After a successful insertion, it revalidates relevant page paths.
 * @param {AddressPayload} formData - An object containing the new address data.
 * @returns {Promise<ApiResponse<boolean>>} A promise that resolves to an object
 * indicating success (true) or failure, along with an error message.
 */
export async function addAddress(
  formData: AddressPayload,
): Promise<ApiResponse<boolean>> {
  const supabase = await createServerClient();
  const { data: user, error: userError } = await getUser();

  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "Authentication failed." };
  }

  const { error } = await supabase
    .from("user_addresses")
    .insert({ ...formData, user_id: user.id });

  if (error) {
    console.error("Error adding address:", error.message);
    return { data: false, error: "Failed to add address." };
  }

  revalidatePath("/checkout");
  revalidatePath("/addresses");

  return { data: true };
}

//================================================================================
// Delete User Address
//================================================================================
/**
 * Deletes a specific address for the currently authenticated user.
 * As a critical security measure, the `delete` operation requires matching
 * both the address ID and the user ID, preventing a user from deleting
 * another user's address. After a successful deletion, it revalidates
 * relevant page paths.
 * @param {string} addressId - The ID of the address to be deleted.
 * @returns {Promise<ApiResponse<boolean>>} A promise that resolves to an object
 * indicating success (true) or failure, along with an error message.
 */
export async function deleteAddress(
  addressId: string,
): Promise<ApiResponse<boolean>> {
  if (!addressId) {
    return { data: false, error: "Address ID is required." };
  }

  const supabase = await createServerClient();
  const { data: user, error: userError } = await getUser();

  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "Authentication failed." };
  }

  const { error } = await supabase
    .from("user_addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id); // Critical security layer

  if (error) {
    console.error("Error deleting address:", error.message);
    return { data: false, error: "Failed to delete address." };
  }

  revalidatePath("/checkout");
  revalidatePath("/addresses");

  return { data: true };
}
