"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "../supabase/createServerClient";
import { getUser } from "./get-user-action";

// ===============================================================================
// File Name: newsletter.ts
// Description: Newsletter Management Actions
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

// =================================================================
// 1. تحديث الملف الشخصي (البيانات الوصفية)
// =================================================================

type UserMetadataUpdatable = {
  first_name: string;
  last_name: string;
  phone: string;
  date_birth: string;
  gender: string;
  status_message: string;
};

type ProfilePayload = Partial<UserMetadataUpdatable>;

export async function updateUserProfile(
  payload: ProfilePayload,
): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "AUTHENTICATION_FAILED" };
  }

  const dataToUpdate: ProfilePayload = {};
  if (payload.first_name !== undefined)
    dataToUpdate.first_name = payload.first_name;
  if (payload.last_name !== undefined)
    dataToUpdate.last_name = payload.last_name;
  if (payload.phone !== undefined) dataToUpdate.phone = payload.phone;
  if (payload.date_birth !== undefined)
    dataToUpdate.date_birth = payload.date_birth;
  if (payload.gender !== undefined) dataToUpdate.gender = payload.gender;
  if (payload.status_message !== undefined)
    dataToUpdate.status_message = payload.status_message;

  if (Object.keys(dataToUpdate).length === 0) {
    console.error("No data provided to update.");
    return { error: "No data provided to update." };
  }

  const { error } = await supabase.auth.updateUser({ data: dataToUpdate });

  if (error) {
    console.error("Profile update error:", error.message);
    return { error: "Failed to update profile." };
  }

  revalidatePath("/profile");
  return { data: true };
}

// =================================================================
// 2. تحديث كلمة المرور
// =================================================================

type PasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export async function updateUserPassword(
  payload: PasswordPayload,
): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "AUTHENTICATION_FAILED" };
  }

  const email = user.email;

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: email!,
    password: payload.currentPassword,
  });

  if (signInError) {
    console.error("Current password verification error:", signInError.message);
    return { error: "Incorrect current password." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: payload.newPassword,
  });

  if (updateError) {
    if (updateError.message.includes("requires a recent login")) {
      return {
        error: "For security, a confirmation link has been sent to your email.",
      };
    }
    if (updateError.message.includes("requires re-authentication")) {
      return {
        error: "For security, a confirmation link has been sent to your email.",
      };
    }
    console.error("Password update error:", updateError.message);
    return { error: "Failed to update password." };
  }

  revalidatePath("/profile");
  return { data: true };
}

// =================================================================
// 3. إدارة الصورة الرمزية
// =================================================================

const AVATARS_BUCKET = "avatars";

export async function uploadProfilePicture(
  formData: FormData,
): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "AUTHENTICATION_FAILED" };
  }

  const file = formData.get("avatar") as File;
  if (!file) return { error: "No file provided." };

  const oldAvatarUrl =
    user.user_metadata.avatar_url || user.user_metadata.avatar;
  const isOldAvatarFromSupabase = oldAvatarUrl
    ? oldAvatarUrl.includes(process.env.NEXT_PUBLIC_SUPABASE_URL!)
    : false;

  if (isOldAvatarFromSupabase) {
    const oldAvatarPath = oldAvatarUrl
      .split(`${AVATARS_BUCKET}/`)[1]
      ?.split("?")[0];
    if (oldAvatarPath) {
      await supabase.storage.from(AVATARS_BUCKET).remove([oldAvatarPath]);
    }
  }

  const fileExtension = file.name.split(".").pop();
  const newAvatarPath = `public/${user.id}/avatar.${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(newAvatarPath, file, { upsert: true });

  if (uploadError) {
    console.error("Upload Avatar Error:", uploadError.message);
    return { error: "Failed to upload new profile picture." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(newAvatarPath);
  const uniqueUrl = `${publicUrl}?t=${new Date().getTime()}`;

  const { error: updateUserError } = await supabase.auth.updateUser({
    data: { avatar_url: uniqueUrl, avatar: null }, // ✅ مسح رابط OAuth القديم
  });

  if (updateUserError) {
    console.error("Update User Avatar URL Error:", updateUserError.message);
    return {
      error: "Failed to update profile with new picture.",
    };
  }

  revalidatePath("/profile");
  return { data: true };
}

export async function deleteProfilePicture(): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "AUTHENTICATION_FAILED" };
  }
  const avatarUrl = user.user_metadata.avatar_url || user.user_metadata.avatar;
  if (!avatarUrl) return { error: "No profile picture to delete." };

  const isSupabaseAvatar = avatarUrl.includes(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
  );

  if (isSupabaseAvatar) {
    const avatarPath = avatarUrl.split(`${AVATARS_BUCKET}/`)[1]?.split("?")[0];
    if (avatarPath) {
      const { error: removeError } = await supabase.storage
        .from(AVATARS_BUCKET)
        .remove([avatarPath]);
      if (removeError) {
        console.error("Delete Avatar Error:", removeError.message);
        return {
          error: "Failed to delete profile picture from storage.",
        };
      }
    }
  }

  const { error: updateUserError } = await supabase.auth.updateUser({
    data: {
      avatar_url: null, // مسح حقلنا المخصص
      avatar: null, // مسح حقل OAuth الافتراضي
    },
  });
  // ---------------------------------

  if (updateUserError) {
    console.error("Remove User Avatar URL Error:", updateUserError.message);
    return {
      error: "Failed to update profile after deleting picture.",
    };
  }

  revalidatePath("/profile");
  return { data: true };
}

type SignOutResponse = { success: boolean; error?: string };

export async function signOut(): Promise<SignOutResponse> {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { success: false, error: error.message };
  } else {
    return { success: true };
  }
}
