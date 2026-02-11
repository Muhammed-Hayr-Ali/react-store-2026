// lib\auth.ts

"use client";

import { AuthError } from "@supabase/supabase-js";
import { createBrowserClient } from "../supabase/createBrowserClient";



export async function signOut(): Promise<AuthError | null> {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log("Error signing out:", error);
    throw error;
  }

  return null;
}

