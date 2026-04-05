import { AuthDebug } from "@/components/debug/auth-debug"

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main>
      {children}
      <AuthDebug />
    </main>
  )
}
