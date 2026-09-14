"use server"

import { createServerClient } from "@/lib/database/supabase/server"

export default async function readMyProfile(){
  const supabase = await createServerClient()

  //   get profile from custom function
  const { data, error } = await supabase.rpc("read_my_profile")

  if (error) {
    return {
      success: false,
      error: "FAILED_TO_FETCH_PUBLIC_PROFILE",
      details: {
        error: [error.message],
      },
    }
  }

  return {
    success: true,
    data,
  }
}
