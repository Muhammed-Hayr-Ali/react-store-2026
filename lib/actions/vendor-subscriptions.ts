"use server";

import { getUser } from "./get-user-action";
import { createServerClient } from "../supabase/createServerClient";
import { revalidatePath } from "next/cache";

// ===============================================================================
// File Name: vendor-subscriptions.ts
// Description: Vendor Subscription Management Actions
// Status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-03-15
// Copyright (c) 2026 Mohammed Kher Ali
// ===============================================================================

// ================================================================================
// Types
// ================================================================================
export type SubscriptionPlan = {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  description: string;
  description_ar: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  trial_period_days: number;
  max_products: number;
  max_images_per_product: number;
  max_variants_per_product: number;
  storage_limit_mb: number;
  commission_rate: number;
  has_analytics: boolean;
  has_priority_support: boolean;
  has_custom_domain: boolean;
  has_discount_codes: boolean;
  has_bulk_upload: boolean;
  has_api_access: boolean;
  display_order: number;
  is_active: boolean;
  is_popular: boolean;
};

export type VendorSubscription = {
  id: string;
  vendor_id: string;
  plan_id: string;
  status: "active" | "cancelled" | "expired" | "trial" | "past_due";
  billing_cycle: "monthly" | "yearly";
  started_at: string;
  current_period_start: string;
  current_period_end: string;
  trial_ends_at: string | null;
  cancelled_at: string | null;
  ends_at: string | null;
  products_count: number;
  storage_used_mb: number;
  plan: SubscriptionPlan;
};

export type VendorSubscriptionInfo = {
  plan_name: string;
  plan_slug: string;
  status: string;
  billing_cycle: string;
  current_period_end: string | null;
  products_count: number;
  max_products: number;
  storage_used_mb: number;
  storage_limit_mb: number;
  commission_rate: number;
  has_analytics: boolean;
  has_priority_support: boolean;
  has_custom_domain: boolean;
  has_discount_codes: boolean;
  has_bulk_upload: boolean;
  has_api_access: boolean;
};

export type ProductLimitCheck = {
  can_add: boolean;
  current_count: number;
  max_allowed: number;
  message: string;
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  [key: string]: unknown;
};

// =================================================================
// Get all active subscription plans
// =================================================================
export async function getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching subscription plans:", error);
    return { error: "Failed to fetch subscription plans." };
  }

  return { data: data as SubscriptionPlan[] };
}

// =================================================================
// Get vendor subscription by vendor ID
// =================================================================
export async function getVendorSubscription(
  vendorId: string
): Promise<ApiResponse<VendorSubscription | null>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("vendor_subscriptions")
    .select("*, plan:subscription_plans(*)")
    .eq("vendor_id", vendorId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching vendor subscription:", error);
    return { error: "Failed to fetch vendor subscription." };
  }

  if (!data) {
    return { data: null };
  }

  return { data: data as unknown as VendorSubscription };
}

// =================================================================
// Get current user's vendor subscription
// =================================================================
export async function getCurrentUserVendorSubscription(): Promise<
  ApiResponse<VendorSubscription | null>
> {
  const { data: user } = await getUser();

  if (!user) {
    return { error: "AUTHENTICATION_FAILED" };
  }

  const supabase = await createServerClient();

  // First get the vendor
  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!vendor) {
    return { data: null };
  }

  return await getVendorSubscription(vendor.id);
}

// =================================================================
// Get vendor subscription info (using RPC function)
// =================================================================
export async function getVendorSubscriptionInfo(
  vendorId: string
): Promise<ApiResponse<VendorSubscriptionInfo | null>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .rpc("get_vendor_subscription_info", { p_vendor_id: vendorId })
    .single();

  if (error) {
    console.error("Error fetching vendor subscription info:", error);
    return { error: "Failed to fetch vendor subscription info." };
  }

  return { data: data as VendorSubscriptionInfo | null };
}

// =================================================================
// Check vendor product limit
// =================================================================
export async function checkVendorProductLimit(
  vendorId: string
): Promise<ApiResponse<ProductLimitCheck>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .rpc("check_vendor_product_limit", { p_vendor_id: vendorId })
    .single();

  if (error) {
    console.error("Error checking vendor product limit:", error);
    return {
      error: "Failed to check product limit.",
      data: {
        can_add: false,
        current_count: 0,
        max_allowed: 0,
        message: "Error checking limit",
      },
    };
  }

  return { data: data as ProductLimitCheck };
}

// =================================================================
// Subscribe to a plan (creates or updates subscription)
// =================================================================
export async function subscribeToPlan(
  planSlug: string,
  billingCycle: "monthly" | "yearly" = "monthly"
): Promise<ApiResponse<boolean>> {
  const { data: user } = await getUser();

  if (!user) {
    return { error: "AUTHENTICATION_FAILED" };
  }

  const supabase = await createServerClient();

  // Get the plan
  const { data: plan } = await supabase
    .from("subscription_plans")
    .select("id, trial_period_days")
    .eq("slug", planSlug)
    .eq("is_active", true)
    .single();

  if (!plan) {
    return { error: "Invalid plan selected." };
  }

  // Get the vendor
  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!vendor) {
    return { error: "Vendor profile not found. Please create your store first." };
  }

  // Calculate period end date
  const now = new Date();
  const trialEndsAt = plan.trial_period_days > 0
    ? new Date(now.getTime() + plan.trial_period_days * 24 * 60 * 60 * 1000)
    : null;

  const currentPeriodEnd = trialEndsAt
    ? new Date(trialEndsAt.getTime())
    : billingCycle === "monthly"
    ? new Date(now.setMonth(now.getMonth() + 1))
    : new Date(now.setFullYear(now.getFullYear() + 1));

  // Check if subscription exists
  const { data: existingSubscription } = await supabase
    .from("vendor_subscriptions")
    .select("id")
    .eq("vendor_id", vendor.id)
    .single();

  let error;

  if (existingSubscription) {
    // Update existing subscription
    const { error: updateError } = await supabase
      .from("vendor_subscriptions")
      .update({
        plan_id: plan.id,
        status: plan.trial_period_days > 0 ? "trial" : "active",
        billing_cycle: billingCycle,
        current_period_start: now.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        trial_ends_at: trialEndsAt?.toISOString(),
        cancelled_at: null,
        ends_at: null,
        updated_at: now.toISOString(),
      })
      .eq("vendor_id", vendor.id);

    error = updateError;
  } else {
    // Create new subscription
    const { error: insertError } = await supabase.from("vendor_subscriptions").insert({
      vendor_id: vendor.id,
      plan_id: plan.id,
      status: plan.trial_period_days > 0 ? "trial" : "active",
      billing_cycle: billingCycle,
      current_period_start: now.toISOString(),
      current_period_end: currentPeriodEnd.toISOString(),
      trial_ends_at: trialEndsAt?.toISOString(),
      products_count: 0,
      storage_used_mb: 0,
    });

    error = insertError;
  }

  if (error) {
    console.error("Error subscribing to plan:", error);
    return { error: "Failed to subscribe to plan." };
  }

  // Update vendor's subscription tier
  await supabase
    .from("vendors")
    .update({ subscription_tier_id: plan.id, updated_at: now.toISOString() })
    .eq("id", vendor.id);

  revalidatePath("/dashboard/vendor");
  revalidatePath("/pricing");

  return { data: true };
}

// =================================================================
// Cancel subscription
// =================================================================
export async function cancelVendorSubscription(): Promise<ApiResponse<boolean>> {
  const { data: user } = await getUser();

  if (!user) {
    return { error: "AUTHENTICATION_FAILED" };
  }

  const supabase = await createServerClient();

  // Get the vendor
  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!vendor) {
    return { error: "Vendor profile not found." };
  }

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("vendor_subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: now,
      ends_at: now,
      updated_at: now,
    })
    .eq("vendor_id", vendor.id);

  if (error) {
    console.error("Error cancelling subscription:", error);
    return { error: "Failed to cancel subscription." };
  }

  revalidatePath("/dashboard/vendor");
  revalidatePath("/pricing");

  return { data: true };
}

// =================================================================
// Get current user's vendor ID
// =================================================================
export async function getCurrentUserVendorId(): Promise<ApiResponse<string | null>> {
  const { data: user } = await getUser();

  if (!user) {
    return { error: "AUTHENTICATION_FAILED" };
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching vendor:", error);
    return { error: "Failed to fetch vendor." };
  }

  return { data: data?.id || null };
}

// =================================================================
// Create vendor profile
// =================================================================
export async function createVendorProfile(
  storeName: string,
  storeSlug: string,
  description?: string,
  descriptionAr?: string
): Promise<ApiResponse<string>> {
  const { data: user } = await getUser();

  if (!user) {
    return { error: "AUTHENTICATION_FAILED" };
  }

  const supabase = await createServerClient();

  // Check if store name or slug already exists
  const { data: existing } = await supabase
    .from("vendors")
    .select("id")
    .or(`store_name.eq.${storeName},store_slug.eq.${storeSlug}`)
    .single();

  if (existing) {
    return { error: "Store name or slug already taken." };
  }

  // Create vendor
  const { data, error } = await supabase.from("vendors").insert({
    user_id: user.id,
    store_name: storeName,
    store_slug: storeSlug,
    description: description || null,
    description_ar: descriptionAr || null,
    is_active: true,
    is_verified: false,
  }).select("id").single();

  if (error) {
    console.error("Error creating vendor:", error);
    return { error: "Failed to create vendor profile." };
  }

  // Auto-subscribe to free plan
  const { data: freePlan } = await supabase
    .from("subscription_plans")
    .select("id")
    .eq("slug", "free")
    .single();

  if (freePlan) {
    const now = new Date().toISOString();
    await supabase.from("vendor_subscriptions").insert({
      vendor_id: data.id,
      plan_id: freePlan.id,
      status: "active",
      billing_cycle: "monthly",
      current_period_start: now,
      current_period_end: now,
      products_count: 0,
      storage_used_mb: 0,
    });

    await supabase
      .from("vendors")
      .update({ subscription_tier_id: freePlan.id })
      .eq("id", data.id);
  }

  revalidatePath("/dashboard/vendor");

  return { data: data.id };
}
