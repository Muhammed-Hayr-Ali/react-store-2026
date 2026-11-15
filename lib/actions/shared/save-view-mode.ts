"use server"

/**
 * @file lib/actions/store/mutations/save-view-mode.ts
 * @description Server action to securely save the user's preferred store view mode (grid or list) in cookies.
 */

import { COOKIES_KEYS } from "@/lib/config/app_config"
import { cookies } from "next/headers"

export async function saveViewMode(mode: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIES_KEYS.VIEW_MODE, mode, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })
}
