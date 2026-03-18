import { GuestGuard } from "@/lib/middleware/guest-guard"

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main>
      <GuestGuard />
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </main>
  )
}
