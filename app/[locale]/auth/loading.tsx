/**
 * @file app/[locale]/(auth)/loading.tsx
 * @description 1:1 geometric matching skeleton loader to eliminate Cumulative Layout Shift (CLS).
 */

"use client"

import { usePathname } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"

export default function AuthLoading() {
  const pathname = usePathname()
  const isSignup = pathname.endsWith("/signup")
  const isForgotPassword = pathname.endsWith("/forgot-password")
  const isResetPassword = pathname.endsWith("/reset-password")
  const isOAuthCallback = pathname.endsWith("/callback")

  if (isOAuthCallback) {
    return (
      <div className="flex w-full flex-col items-center justify-center py-6 text-center">
        <Spinner className="size-7 text-primary" />
        <Skeleton className="mt-4 h-5 w-40" />
        <Skeleton className="mt-2 h-3 w-56 max-w-full" />
      </div>
    )
  }

  const fieldCount = isSignup ? 4 : isForgotPassword ? 1 : 2
  const hasOAuth = !isForgotPassword && !isResetPassword

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-2 pb-6 text-start">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-36 sm:h-9 sm:w-44" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="space-y-4">
        {isSignup && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1].map((field) => (
              <div key={field} className="space-y-1.5">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
        )}

        {Array.from({ length: fieldCount - (isSignup ? 2 : 0) }).map(
          (_, index) => {
            const isPasswordField =
              isResetPassword ||
              (isSignup && index === 1) ||
              (!isSignup && !isForgotPassword && index === 1)

            return (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton
                    className={`h-3.5 ${isPasswordField ? "w-20" : "w-16"}`}
                  />
                  {isPasswordField && !isResetPassword && (
                    <Skeleton className="h-3.5 w-24" />
                  )}
                </div>
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            )
          }
        )}

        <div className="pt-2">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {hasOAuth && (
          <>
            <div className="flex items-center gap-2 py-1">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-3 w-6" />
              <Skeleton className="h-px flex-1" />
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
          </>
        )}
      </div>
    </div>
  )
}
