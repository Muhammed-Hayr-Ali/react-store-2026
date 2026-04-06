// =====================================================
// 📸 Upload Avatar Server Action
// =====================================================
// Handles avatar image upload to Supabase Storage
// =====================================================

"use server";

import { createClient } from "@/lib/database/supabase/server";
import { ApiResult } from "@/lib/database/types";
import { verifyCsrfToken } from "@/lib/security/csrf-server-action";

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export type UploadAvatarResult = ApiResult<{
  avatar_url: string;
}>;

export async function uploadAvatar(
  _prevState: unknown,
  formData: FormData,
): Promise<UploadAvatarResult> {
  // Verify CSRF token
  const csrfCheck = await verifyCsrfToken(formData);
  if (!csrfCheck.valid) {
    return {
      success: false,
      error: "CSRF_ERROR",
    };
  }

  // Get file from form
  const file = formData.get("avatar") as File;

  if (!file || file.size === 0) {
    return {
      success: false,
      error: "No file provided",
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: "File size must be less than 5MB",
    };
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Only JPEG, PNG, WebP, and GIF images are allowed",
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

  // Generate unique filename
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  // Convert File to ArrayBuffer for upload
  const fileBuffer = await file.arrayBuffer();

  // Delete old avatar images (keep only latest)
  const { data: oldFiles } = await supabase.storage
    .from("avatars")
    .list(user.id);

  if (oldFiles && oldFiles.length > 0) {
    const oldPaths = oldFiles.map((f) => `${user.id}/${f.name}`);
    await supabase.storage.from("avatars").remove(oldPaths);
  }

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, fileBuffer, {
      contentType: file.type,
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadError) {
    console.error("Upload failed:", uploadError);
    return {
      success: false,
      error: "Failed to upload image",
    };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from("core_profile")
    // @ts-expect-error - Supabase type inference issue
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) {
    console.error("Failed to update profile:", updateError);
    // Clean up uploaded file if profile update fails
    await supabase.storage.from("avatars").remove([filePath]);
    return {
      success: false,
      error: "Failed to update profile with new avatar",
    };
  }

  return {
    success: true,
    data: {
      avatar_url: publicUrl,
    },
  };
}
