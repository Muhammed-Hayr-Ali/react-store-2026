"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { handleCallback } from "@/lib/actions/authentication"
import { appRoutes } from "@/lib/config/app-routes"
import { Spinner } from "../ui/spinner"
import { Button } from "../ui/button"

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
  const hasProcessed = useRef(false)

  useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true

    if (code) {
      const processCode = async () => {
        try {
          const result = await handleCallback(code)
          if (result.success) {
            toast.success("Successfully logged in!")
            router.refresh()
            router.replace(appRoutes.home)
          } else {
            toast.error(result.error || "Authentication exchange failed.")
            router.replace(appRoutes.auth.login)
          }
        } catch (err) {
          console.error("OAuth Callback Error:", err)
          toast.error("Failed to complete login.")
          router.replace(appRoutes.auth.login)
        }
      }

      processCode()
    }
  }, [code, router])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
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
        <h1 className="text-2xl font-bold text-foreground">Login Failed</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {errorDescription ||
            "The process was canceled or permissions were denied."}
        </p>
        <Button
          variant="outline"
          onClick={() => router.replace(appRoutes.auth.login)}
        >
          Return to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Spinner className="size-6" />
      <div className="text-center">
        <h1 className="text-2xl font-bold">Loading...</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Processing your authentication...
        </p>
      </div>
    </div>
  )
}
