"use server";

import { createServerClient } from "@/lib/supabase/createServerClient";
import { User } from "@supabase/supabase-js";

export type GetUserResponse<T> = {
  error?: string;
  data?: T;
};

export type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  updated_at: string;
};

export async function getUser(): Promise<GetUserResponse<User>> {
  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching user:", error.message);
    return { error: error.message };
  }
  const data = user;
  if (!data) {
    return { error: "User not found" };
  }

  return { data, error: "" };
}

export async function getUserProfileByEmail(
  email: string,
): Promise<GetUserResponse<Profile | null>> {
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
