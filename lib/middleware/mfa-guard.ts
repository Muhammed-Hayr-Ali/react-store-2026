import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { appRouter } from "@/lib/navigation"

export async function MfaGuard() {
  try {
    const supabase = await createClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return null
    }

    const jwt = session.access_token

    if (!jwt || jwt === "") {
      return null
    }

    const { data, error } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel(jwt)

    if (error) {
      console.error("[MfaGuard] AAL check failed:", {
        message: error.message ?? "Unknown error",
        status: error.status ?? "N/A",
        code: "N/A",
        error: JSON.stringify(error),
      })
      return null
    }

    if (!data) {
      console.warn("[MfaGuard] No AAL data returned")
      return null
    }

    const { currentLevel, nextLevel } = data

    if (currentLevel === "aal1" && nextLevel === "aal2") {
      redirect(appRouter.verifyOtp)
    }

    return null
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred"
    console.error("[MfaGuard] Unexpected error:", errorMessage)
    return null
  }
}
