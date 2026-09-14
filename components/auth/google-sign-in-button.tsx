"use client"

import { useState } from "react"
import { CustomButton } from "@/components/ui/custom-button"
import { Spinner } from "@/components/ui/spinner"
import { signInWithGoogle } from "@/lib/actions/authentication/signIn-with-google"
import { Badge } from "../ui/badge"
import { toast } from "sonner"

interface GoogleSignInButtonProps {
  lastLoginMethod: string | undefined
}

export function GoogleSignInButton({
  lastLoginMethod,
}: GoogleSignInButtonProps) {
  // last login method

  // State to manage the loading state of the button during the sign-in process.
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    // initialize cookies

    setIsLoading(true)

    const result = await signInWithGoogle()

    if (result.success) {
      window.location.href = result.data.url //
    } else {
      toast.error("Something went wrong during Google sign-in.")
      setIsLoading(false)
    }
  }

  return (
    <div className="relative w-full">
      {lastLoginMethod === "google" && (
        <div className="absolute -top-2.5 -right-2.5 z-50 rtl:right-auto rtl:-left-2.5">
          <Badge
            variant="secondary"
            className="h-4 px-1.5 text-[10px] font-normal border-muted-foreground/50 text-muted-foreground dark:border-muted-foreground/50 dark:text-muted-foreground/50"
          >
            Last used
          </Badge>
        </div>
      )}
      <CustomButton
        type="button"
        variant={"secondary"}
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="flex w-full items-center justify-between gap-2 uppercase"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="size-4"
        >
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        {isLoading ? <Spinner /> : <div className="size-4" />}
        <p>continue with Google</p>
        <div className="size-4" />
        <div className="size-3" />
      </CustomButton>
    </div>
  )
}
