import { createMetadata } from "@/lib/config/metadata_generator"
import { Suspense } from "react"
import AuthErrorPage from "@/components/auth/auth-error-page"

export const metadata = createMetadata({
  title: "Authentication Error",
  description: "There was an error during authentication",
  path: "/auth-error",
  noindex: true,
})

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    }>
      <AuthErrorPage />
    </Suspense>
  )
}
