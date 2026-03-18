import { createMetadata } from "@/lib/config/metadata_generator"
import CallbackPage from "@/components/auth/callback-page"

export const metadata = createMetadata({
  title: "Authentication Callback",
  description: "Processing authentication callback",
  path: "/callback",
  noindex: true,
})

export default function Page() {
  return <CallbackPage />
}
