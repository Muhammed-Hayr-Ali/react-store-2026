/**
 * Database Schema Definition
 * Centralized table and column names for type-safe database access
 * Generated from Supabase SQL migration files
 *
 * Folder Structure:
 * - 01_password_reset
 * - 02_profiles
 * - 03_roles
 * - 04_profile_roles_links
 * - 05_subscription_plans
 * - 06_profile_plans
 */

export const db = {
  // 01_password_reset
  password_reset_tokens: {
    table: "password_reset_tokens",
    primaryKey: "id",
    columns: {
      id: "id",
      user_id: "user_id",
      email: "email",
      token: "token",
      expires_at: "expires_at",
      used_at: "used_at",
      ip_address: "ip_address",
      created_at: "created_at",
    },
  },

  // 02_profiles
  profiles: {
    table: "profiles",
    primaryKey: "id",
    columns: {
      id: "id",
      email: "email",
      provider: "provider",
      first_name: "first_name",
      last_name: "last_name",
      full_name: "full_name",
      phone: "phone",
      phone_verified: "phone_verified",
      avatar_url: "avatar_url",
      bio: "bio",
      email_verified: "email_verified",
      created_at: "created_at",
      updated_at: "updated_at",
      last_sign_in_at: "last_sign_in_at",
    },
  },

  // 03_roles
  roles: {
    table: "roles",
    primaryKey: "id",
    columns: {
      id: "id",
      name: "name",
      description: "description",
      permissions: "permissions",
      created_at: "created_at",
      updated_at: "updated_at",
    },
  },

  // 04_profile_roles_links
  profile_roles: {
    table: "profile_roles",
    primaryKey: ["user_id", "role_id"],
    columns: {
      user_id: "user_id",
      role_id: "role_id",
      is_active: "is_active",
      granted_at: "granted_at",
      granted_by: "granted_by",
    },
  },

  // 05_subscription_plans
  plans: {
    table: "plans",
    primaryKey: "id",
    columns: {
      id: "id",
      category: "category",
      name: "name",
      price: "price",
      billing_period: "billing_period",
      permissions: "permissions",
      is_default: "is_default",
      is_popular: "is_popular",
    },
  },

  // 06_profile_plans
  profile_plans: {
    table: "profile_plans",
    primaryKey: "id",
    columns: {
      id: "id",
      user_id: "user_id",
      plan_id: "plan_id",
      status: "status",
      start_date: "start_date",
      end_date: "end_date",
      trial_end_date: "trial_end_date",
      created_at: "created_at",
      updated_at: "updated_at",
    },
  },
} as const
