import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { getCurrentUser } from "@/lib/actions/utils/profile"
import { getLocale } from "next-intl/server"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const currentUser = await getCurrentUser()
  const side = locale === "ar" ? "right" : "left"

  return (
    <SidebarProvider>
      <AppSidebar
        currentUser={currentUser}
        role={currentUser?.role}
        side={side}
      />
      {children}
    </SidebarProvider>
  )
}
