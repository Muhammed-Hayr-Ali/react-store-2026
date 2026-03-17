import { GuestGuard } from "@/lib/middleware/guest-guard"
import { MfaGuard } from "@/lib/middleware/mfa-guard"

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main>
        <GuestGuard />
        <MfaGuard />
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="w-full max-w-lg">{children}</div>
        </div>
    </main>
  )
}
