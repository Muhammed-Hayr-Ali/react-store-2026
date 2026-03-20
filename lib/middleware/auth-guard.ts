import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/createServerClient"
import { appRouter } from "@/lib/app-routes"

export async function AuthGuard({
  redirectPath = appRouter.signIn,
}: {
  redirectPath?: string
}) {
  // Create a new server client
  const supabase = await createServerClient()

  // Get the user
  const { error } = await supabase.auth.getUser()

  // Check for errors
  if (error) {
    return redirect(redirectPath)
  }

  return null
}
