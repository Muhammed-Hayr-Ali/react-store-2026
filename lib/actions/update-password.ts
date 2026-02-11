"use server";

import { createAdminClient } from "../supabase/admin";
import { createServerClient } from "../supabase/createServerClient";

export type ResetTokenData = {
  is_valid: boolean;
  user_id?: string | null;
  error: string | null;
};

export type UpdatePasswordResponse<T> = {
  data?: T | null;
  error?: string | null;
};

export async function checkResetToken(token: string): Promise<ResetTokenData> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .rpc("validate_reset_token", { p_token: token })
    .single();

  if (error) {
    return { is_valid: false, error: error.message, user_id: null };
  }
  return data as ResetTokenData;
}

export async function updatePassword({
  token,
  resetTokenData,
  password,
}: {
  token: string;
  resetTokenData: ResetTokenData;
  password: string;
}): Promise<UpdatePasswordResponse<null>> {
  if (!resetTokenData.is_valid || !resetTokenData.user_id) {
    return { error: "Invalid reset token" };
  }

  const supabaseAdmin = createAdminClient();
  const supabase = await createServerClient();

  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    resetTokenData.user_id,
    {
      password,
    },
  );

  if (error) return { data: null, error: "Failed to update password" };

  await supabase.rpc("mark_token_as_used", {
    p_token: token,
  });

  await supabaseAdmin.auth.admin.signOut(resetTokenData.user_id, "global");

  return { data: null, error: null };
}
