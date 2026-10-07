"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { PublicProfile } from "./types"

export default async function readProfile({
  userId,
}: {
  userId: string | null
}): Promise<ApiResult<PublicProfile | null>> {
  if (!userId) {
    return {
      success: false,
      error: "MISSING_USER_ID",
    }
  }

  // التحقق من أن المعرّف هو UUID صالح
  const idValidation = z.string().uuid("INVALID_ID").safeParse(userId)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_USER_ID",
    }
  }

  const supabase = await createServerClient()

  // get profile from custom function
  const { data, error } = await supabase.rpc("read_profile", {
    p_id: idValidation.data,
  })

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
