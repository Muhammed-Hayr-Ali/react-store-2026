// =====================================================
// 🔄 Update Profile Server Action
// =====================================================
// Updates user profile information in core_profile table
// =====================================================

"use server";

import { createClient } from "@/lib/database/supabase/server";
import { ApiResult, CoreProfileUpdate } from "@/lib/database/types";
import { z } from "zod";
import { verifyCsrfToken } from "@/lib/security/csrf-server-action";

// Schema validation for profile update
const updateProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50).optional(),
  last_name: z.string().min(1, "Last name is required").max(50).optional(),
  phone_number: z
    .string()
    .regex(/^\+?[\d\s-()]{0,20}$/, "Invalid phone number format")
    .max(20)
    .nullable(),
  preferred_language: z.enum(["en", "ar"]).optional(),
  timezone: z.string().max(50).optional(),
  avatar_url: z.string().url().nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type UpdateProfileResult = ApiResult<{
  preferred_language?: string;
}>;

export async function updateProfile(
  _prevState: unknown,
  formData: FormData,
): Promise<UpdateProfileResult> {
  // Verify CSRF token
  const csrfCheck = await verifyCsrfToken(formData);
  if (!csrfCheck.valid) {
    return {
      success: false,
      error: "CSRF_ERROR",
    };
  }

  // Extract and validate input
  const input: UpdateProfileInput = {
    first_name: (formData.get("first_name") as string) || undefined,
    last_name: (formData.get("last_name") as string) || undefined,
    phone_number: (formData.get("phone_number") as string) || null,
    preferred_language:
      (formData.get("preferred_language") as "en" | "ar" | undefined) ||
      undefined,
    timezone: (formData.get("timezone") as string) || undefined,
    avatar_url: (formData.get("avatar_url") as string) || null,
  };

  const validation = updateProfileSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues.map((e) => e.message).join(", "),
    };
  }

  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "UNAUTHORIZED",
    };
  }

  // Build update object (only include non-undefined fields)
  const updateData: CoreProfileUpdate = {};
  if (input.first_name !== undefined) updateData.first_name = input.first_name;
  if (input.last_name !== undefined) updateData.last_name = input.last_name;
  if (input.phone_number !== undefined)
    updateData.phone_number = input.phone_number;
  if (input.preferred_language !== undefined)
    updateData.preferred_language = input.preferred_language;
  if (input.timezone !== undefined) updateData.timezone = input.timezone;
  if (input.avatar_url !== undefined) updateData.avatar_url = input.avatar_url;

  // Update profile in database
  const { error: updateError } = await supabase
    .from("core_profile")
    // @ts-expect-error - Supabase type inference issue with never type
    .update(updateData)
    .eq("id", user.id);

  if (updateError) {
    console.error("Failed to update profile:", updateError);
    return {
      success: false,
      error: "Failed to update profile",
    };
  }

  return {
    success: true,
    data: {
      preferred_language: input.preferred_language,
    },
  };
}
