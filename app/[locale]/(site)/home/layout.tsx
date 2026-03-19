import { MfaGuard } from "@/lib/middleware/mfa-guard"

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main>
      <MfaGuard />
      {children}
    </main>
  )
}
