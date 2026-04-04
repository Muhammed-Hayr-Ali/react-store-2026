"use client"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/database/supabase/client"

export default function GoogleOneTap() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleLogin = useCallback(
    async (response: { credential: string }) => {
      console.log("[OneTap] ✅ Login callback triggered")
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      })
      if (!error) {
        console.log("[OneTap] ✅ Login success, refreshing")
        router.refresh()
      } else {
        console.error("[OneTap] ❌ Login error:", error)
      }
    },
    [router]
  )

  useEffect(() => {
    if (!isClient) return

    console.log("[OneTap] ⏳ Checking session...")

    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log("[OneTap] 🔒 User already logged in, skipping One Tap")
        return
      }

      console.log("[OneTap] 👤 Guest user detected, setting up One Tap...")

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (!clientId) {
        console.error("[OneTap] ❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing!")
        return
      }

      // Wait for Google script to load
      const checkGoogleLoaded = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkGoogleLoaded)
          console.log("[OneTap] 🚀 Google GSI script loaded")

          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleLogin,
            auto_select: false,
            use_fedcm_for_prompt: true,
          })

          console.log("[OneTap] 🔔 Calling prompt()...")
          window.google.accounts.id.prompt()
        }
      }, 100)

      // Cleanup
      return () => clearInterval(checkGoogleLoaded)
    })
  }, [isClient, handleLogin])

  if (!isClient) return null

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
    />
  )
}
