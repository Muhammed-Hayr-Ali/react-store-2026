import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/createServerClient"
import { appRouter } from "@/lib/app-routes"

export async function MfaGuard() {
  // Create a new server client
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const jwt = session?.access_token

  if (!jwt) {
    return null
  }

  const { data, error } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel(jwt)

  if (error) {
    console.error("AalGuard Error:", error)
    return null
  }

  const currentLevel = data.currentLevel
  const nextLevel = data.nextLevel

  if (currentLevel === "aal1" && nextLevel === "aal2") {
    return redirect(appRouter.verifyOtp)
  }

  return null
}
