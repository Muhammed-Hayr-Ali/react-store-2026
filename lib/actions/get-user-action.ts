//lib\actions\get-user-action.ts

"use server";

import { createServerClient } from "@/lib/supabase/createServerClient";
import { User } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";
import { getCurrentUserRoles } from "./user_roles";

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

export async function getUserWithRole(): Promise<{  user?: User; role?: "admin" | "user" , error?: string}> {
  const supabase = await createServerClient();
  noStore();

const [
  userResponse,
  roleResponse,
] = await Promise.all([
  supabase.auth.getUser(),
  getCurrentUserRoles(),
]);

  const  user = userResponse;
  const  roles = roleResponse;

if (user.error) {
    return { error: user.error.message };
  }

  return  {
      user: user.data.user,
      role: roles.includes("admin") ? "admin" : "user",
    
  };
}



export async function getUser(): Promise<ApiResponse<User | null>> {
  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    // console.error("Error fetching session:", error.message);
    return { error: error.message };
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
