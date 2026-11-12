"use server"

import { COOKIES_KEYS } from "@/lib/config/app_config"
import { cookies } from "next/headers"

export default async function saveTheme( newTheme: string ) {
  const cookieStore = await cookies()

  cookieStore.set(COOKIES_KEYS.APP_THEME, newTheme)
}
