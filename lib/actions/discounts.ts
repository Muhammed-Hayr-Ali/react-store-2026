"use server";

import { createAdminClient } from "../supabase/admin";
import { generateRandomCode } from "./generate-discount-code";

// ===============================================================================
// File Name: discounts.ts
// Description: Discount Code Management Actions
// status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-02-010
// Version: 1.0
// Copyright (c) 2023 Mohammed Kher Ali
// ===============================================================================

// ===============================================================================
// Api Response Type
// ===============================================================================
export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// ==============================================================================
// Discount Code Types
// =============================================================================

export type DiscountCode = {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  expires_at: string | null;
  usage_limit: number | null;
  times_used: number;
  is_active: boolean;
  created_at: string;
};

export type DiscountCodePayload = Omit<
  DiscountCode,
  "id" | "times_used" | "created_at"
>;


// =============================================================================
// Create Discount Code Action
// =============================================================================
export async function createDiscountCode(payload: DiscountCodePayload): Promise<ApiResponse<DiscountCode>> {
  // Create a Supabase Admin client
  const supabase = createAdminClient();

  // Use provided code or generate a random one if not provided
  const finalCode = payload.code || generateRandomCode(8);

  payload.code = finalCode.toUpperCase();
  payload.is_active = true;

  const { data, error } = await supabase
    .from("discount_codes")
    .insert(payload)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        error: `The code "${finalCode}" already exists. Please try a different one.`,
      };
    }
    console.error("Error creating discount code:", error);
    return { error: "Failed to create discount code." };
  }

  return { data };
}
