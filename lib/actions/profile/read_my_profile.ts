"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { PublicProfile } from "./types"

export default async function readMyProfile(): Promise<
  ApiResult<PublicProfile | null>
> {
  const supabase = await createServerClient()

  // get profile from custom function
  const { data, error } = await supabase.rpc("read_my_profile")

  if (error) {
    return {
      success: false,
      error: "FAILED_TO_FETCH_PUBLIC_PROFILE",
      details: {
        database: [error.message],
      },
    }
  }

  return {
    success: true,
    data: data as PublicProfile,
  }
}
