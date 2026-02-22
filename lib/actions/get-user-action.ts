//lib\actions\get-user-action.ts

"use server";

import { createServerClient } from "@/lib/supabase/createServerClient";
import { User } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";
import { getCurrentUserRoles } from "./user_roles";

//==============================================================================
// File Name: get-user-action.ts
// Description: User Retrieval Actions
// status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-02-010
// Version: 1.0
// Copyright (c) 2023 Mohammed Kher Ali
// ===============================================================================

// =============================================================================
// Api Response Type
// =============================================================================
export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// =============================================================================
// User Profile Type
// =============================================================================
export type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  updated_at: string;
};

// =============================================================================
// Get User with Role Action
// =============================================================================
export async function getUserWithRole(): Promise<
  ApiResponse<{ user: User; role: string[] }>
> {
  // No cache for this route
  noStore();
  // Create a Supabase Server client
  const supabase = await createServerClient();

  // Fetch user and roles in parallel
  const [userResponse, roleResponse] = await Promise.all([
    supabase.auth.getUser(),
    getCurrentUserRoles(),
  ]);

  // Extract user and roles from responses
  const user = userResponse;
  const roles = roleResponse;

  // Handle errors for user retrieval
  if (user.error) {
    // console.error("Error fetching session:", user.error.message);
    return { error: "Failed to fetch user data" };
  }
  // return user data along with roles
  return {
    data: {
      user: user.data.user,
      role: roles,
    },
  };
}

// =============================================================================
// Get User Action (without roles)
// =============================================================================
export async function getUser(): Promise<ApiResponse<User | null>> {
  // Create a Supabase Server client
  const supabase = await createServerClient();
  // Fetch the currently authenticated user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Handle errors for user retrieval
  if (error) {
    // console.error("Error fetching session:", error.message);
    return { error: error.message };
  }

  // Return the user
  return { data: user };
}

// =============================================================================
// Get User Profile by Email Action
// =============================================================================
export async function getUserProfileByEmail(
  email: string,
): Promise<ApiResponse<Profile | null>> {
  // Create a Supabase Server client
  const supabase = await createServerClient();
  // Fetch the user profile based on the provided email
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  // Handle errors for profile retrieval
  if (profileError) {
    console.error("Error fetching profile:", profileError.message);
    return { error: profileError.message };
  }

  // Return the user profile
  return { data: profile };
}

// =============================================================================
// Check if Current User is Admin Action
// =============================================================================
export async function isAdmin(): Promise<ApiResponse<boolean>> {
  // Create a Supabase Server client
  const supabase = await createServerClient();
  // Call the RPC function to check if the user is an admin
  const { data: result, error } = await supabase.rpc("is_admin");
  // Handle errors for RPC call
  if (error) {
    return { data: false, error: error.message };
  }

  return { data: result as boolean };
}
