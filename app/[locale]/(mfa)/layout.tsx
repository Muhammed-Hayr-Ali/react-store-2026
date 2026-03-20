import { appRouter } from "@/lib/app-routes"
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
