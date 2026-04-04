// components/GoogleOneTap.tsx
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
    const initOneTap = () => {
      if (!window.google) return

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleLogin,
        auto_select: false,
      })

      window.google.accounts.id.prompt()
    }

    // تأخير بسيط عشان ما يتعارض مع أي حاجة تانية
    const timer = setTimeout(initOneTap, 500)
    return () => clearTimeout(timer)
  }, [handleLogin])

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="lazyOnload"
    />
  )
}
