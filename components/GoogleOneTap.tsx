"use client"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/database/supabase/client"

export default function GoogleOneTap() {
  const router = useRouter()
  const handleLoginRef = useRef<
    ((response: { credential: string }) => Promise<void>) | null
  >(null)

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

  // Keep ref updated so global callback always has latest version
  useEffect(() => {
    handleLoginRef.current = handleLogin
  }, [handleLogin])

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) return

    const checkAndInit = () => {
      if (!window.google?.accounts?.id) return

      const callback = async (response: { credential: string }) => {
        if (handleLoginRef.current) {
          await handleLoginRef.current(response)
        }
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback,
        auto_select: false,
        use_fedcm_for_prompt: true,
      })

      window.google.accounts.id.prompt()
    }

    // Poll until Google script is loaded
    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(interval)
        checkAndInit()
      }
    }, 100)

    // Timeout after 10 seconds
    const timeout = setTimeout(() => clearInterval(interval), 10000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
    />
  )
}
