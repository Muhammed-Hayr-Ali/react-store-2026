"use client"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
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

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={() => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!clientId || !window.google) return

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleLogin,
          auto_select: false,
          use_fedcm_for_prompt: true,
        })

        window.google.accounts.id.prompt()
      }}
    />
  )
}
