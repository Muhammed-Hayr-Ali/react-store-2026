//lib\actions\get-user-action.ts

"use server";

import { createServerClient } from "@/lib/supabase/createServerClient";
import { User } from "@supabase/supabase-js";

export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  updated_at: string;
};

export async function getUser(): Promise<ApiResponse<User | null>> {
  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching session:", error.message);
    return { data: undefined, error: error.message };
  }

  return { data: user };
}

export async function getUserProfileByEmail(
  email: string,
): Promise<ApiResponse<Profile | null>> {
  const supabase = await createServerClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError.message);
    return { error: profileError.message };
  }

  return { data: profile, error: "" };
}

export async function isAdmin(): Promise<boolean> {
  const supabase = await createServerClient();

  const { data: result, error } = await supabase.rpc("is_admin");

  if (error) {
    return false;
  }

  return result;
}
