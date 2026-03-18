import { appRouter } from "@/lib/config/app_router"
import { AuthGuard } from "@/lib/middleware/auth-guard"

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main>
      <AuthGuard redirectPath={appRouter.home} />
      {children}
    </main>
  )
}
