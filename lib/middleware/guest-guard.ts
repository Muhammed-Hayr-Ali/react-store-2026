import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/createServerClient"
import { appRouter } from "@/lib/app-routes"

export async function GuestGuard({
  redirectPath = appRouter.home,
}: {
  redirectPath?: string
}) {
  // Create a new server client
  const supabase = await createServerClient()

  // Get the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check for errors
  if (user) {
    return redirect(redirectPath)
  }

  return null
}
