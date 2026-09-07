// components/auth/callback-page.tsx
"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
// Import the Server Action responsible for exchanging the code with Supabase for a user session.
import { handleCallback } from "@/lib/actions/authentication/handleCallback"
import { appRoutes } from "@/lib/config/app-routes"
import { Spinner } from "../ui/spinner"
import { Button } from "../ui/button"
import { toast } from "sonner"

/**
 * The CallbackPage component is responsible for handling the response from an OAuth provider (e.g., Google, GitHub)
 * after the user has approved the sign-in.
 * @param code - The authorization code sent by the provider on success.
 * @param error - The error message if the process failed.
 * @param errorDescription - A detailed description of the error.
 */
export default function CallbackPage({
  code,
  error,
  errorDescription,
}: {
  code: string | undefined
  error: string | undefined
  errorDescription: string | undefined
}) {
  const router = useRouter()

  // Use useRef to ensure the processing logic runs only once, even on re-renders.
  const hasProcessed = useRef(false)

  useEffect(() => {
    // If already processed, do nothing.
    if (hasProcessed.current) return
    hasProcessed.current = true

  

    // Case 2: Successful authentication with a `code`.
    if (code) {
      // Call the Server Action to exchange the code for a user session.
      handleCallback(code)
        .then((result) => {
          if (result.success) {
            // On success, show a welcome toast and redirect to the home page.
            toast.success("Successfully logged in!")
            router.replace(appRoutes.home) // Clean redirect to the home page.
          } else {
            // If the Server Action fails, throw an error to be handled by the `catch` block.
            toast.error(result.error || "Unknown failure")
            throw new Error(result.error || "Unknown failure")
          }
        })
    }
  }, [code, error, errorDescription, router])

  // Display an elegant error UI while waiting if there is an error
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
          <svg
            className="h-8 w-8 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Login Failed
        </h1>
        <p className="max-w-md text-gray-600 dark:text-gray-400">
          {errorDescription ||
            "The process was canceled or permissions were denied."}
        </p>
        <Button variant="outline" onClick={() => router.replace(appRoutes.auth.login)}>
          Return to Login
        </Button>
      </div>
    )
  }

  // On success or during processing, return null to let loading.tsx show automatically
  // During successful processing or while waiting for the result, return `null`.
  // This allows Next.js to automatically render the `loading.tsx` component (if it exists in the same folder),
  // providing a better user experience.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Spinner className="size-6" />
      <div className="text-center">
        <h1 className="text-2xl font-bold">Loading...</h1>
        <p className="mt-2 text-muted-foreground">
          Processing your authentication...
        </p>
      </div>
    </div>
  )
}




