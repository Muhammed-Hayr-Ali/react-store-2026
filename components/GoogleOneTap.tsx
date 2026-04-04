"use client"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/database/supabase/client"

export default function GoogleOneTap() {
  const router = useRouter()
  const [shouldShow, setShouldShow] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[OneTap] Session check:", session ? "logged in" : "guest")
      if (!session) {
        setShouldShow(true)
      }
    })
  }, [])

  const handleLogin = useCallback(
    async (response: { credential: string }) => {
      console.log("[OneTap] Login callback triggered")
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      })
      if (!error) {
        console.log("[OneTap] Login success, refreshing")
        router.refresh()
      } else {
        console.error("[OneTap] Login error:", error)
      }
    },
    [router]
  )

  const handleScriptLoad = useCallback(() => {
    console.log("[OneTap] Google script loaded")
    if (!shouldShow) {
      console.log("[OneTap] User already logged in, skipping")
      return
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    console.log("[OneTap] Client ID:", clientId ? "✅ present" : "❌ missing")

    if (!clientId || !window.google?.accounts?.id) {
      console.log("[OneTap] Google API not ready:", {
        clientId: !!clientId,
        google: !!window.google,
      })
      return
    }

    console.log("[OneTap] Initializing Google One Tap")
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleLogin,
      auto_select: false,
      use_fedcm_for_prompt: true,
    })

    console.log("[OneTap] Calling prompt()")
    window.google.accounts.id.prompt()
  }, [shouldShow, handleLogin])

  if (!shouldShow) {
    console.log("[OneTap] Not rendering - user logged in or checking")
    return null
  }

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={handleScriptLoad}
    />
  )
}
