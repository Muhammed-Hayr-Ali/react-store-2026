"use client"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { useEffect, useCallback } from "react"
import { createClient } from "@/lib/database/supabase/client"

export default function GoogleOneTap() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = useCallback(
    async (response: { credential: string }) => {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      })
      if (!error) router.refresh()
    },
    [supabase, router]
  )

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId || !window.google) return

    // Suppress known Google One Tap errors (storage access, FedCM AbortError)
    const handleError = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || event.reason?.toString() || ""
      if (
        message.includes("storage is not allowed") ||
        message.includes("Access to storage is not allowed") ||
        message.includes("AbortError")
      ) {
        event.preventDefault()
      }
    }

    window.addEventListener("unhandledrejection", handleError)

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleLogin,
      auto_select: false,
      use_fedcm_for_prompt: true,
    })

    window.google.accounts.id.prompt()

    return () => {
      window.removeEventListener("unhandledrejection", handleError)
    }
  }, [handleLogin])

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="lazyOnload"
    />
  )
}
