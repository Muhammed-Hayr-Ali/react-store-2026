"use server"

import { cookies } from "next/headers"
import { SUPPORTED_CURRENCIES } from "../types"

export async function setUserCurrency(currency: string) {
  // التحقق من أن العملة مدعومة
  const isValid = SUPPORTED_CURRENCIES.some((c) => c.code === currency)
  if (!isValid) return { success: false }

  const cookieStore = await cookies()
  cookieStore.set("currency", currency, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // سنة كاملة
    httpOnly: false, // مسموح للعميل قراءته إذا لزم الأمر
  })

  return { success: true }
}
