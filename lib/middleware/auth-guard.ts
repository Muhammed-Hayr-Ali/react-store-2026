import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { appRouter } from "@/lib/navigation"

export async function AuthGuard({
  redirectPath = appRouter.signIn,
}: {
  redirectPath?: string
}) {
  // Create a new server client
  const supabase = await createClient()

  // Get the user
  const { error } = await supabase.auth.getUser()

  // Check for errors
  if (error) {
    return redirect(redirectPath)
  }

  return null
}
