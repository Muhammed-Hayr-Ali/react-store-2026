"use client"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { useCallback, useState, useRef } from "react"
import { createClient } from "@/lib/database/supabase/client"

export default function GoogleOneTap() {
  const router = useRouter()
  const [scriptReady, setScriptReady] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)

  const handleLogin = useCallback(
    async (response: { credential: string }) => {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      })
      if (!error) router.refresh()
    },
    [router]
  )

  const handleScriptLoad = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId || !window.google?.accounts?.id || !buttonRef.current) return

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleLogin,
      auto_select: false,
      use_fedcm_for_prompt: false,
    })

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "signin_with",
    })

    // Try One Tap prompt - it may fail silently in some browsers
    window.google.accounts.id.prompt()

    setScriptReady(true)
  }, [handleLogin])

  // Suppress GSI warnings
  const suppressWarnings = useCallback(() => {
    const originalWarn = console.warn
    console.warn = function (...args) {
      if (
        args[0]?.includes?.("GSI_LOGGER") ||
        args[0]?.includes?.("browser_not_supported")
      ) {
        return
      }
      originalWarn.apply(console, args)
    }
  }, [])

  return (
    <>
      {/* Hidden container for Google Sign-In button */}
      <div
        ref={buttonRef}
        className="pointer-events-none fixed right-4 bottom-4 z-50 opacity-0"
        aria-hidden="true"
      />

      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          suppressWarnings()
          handleScriptLoad()
        }}
      />
    </>
  )
}
