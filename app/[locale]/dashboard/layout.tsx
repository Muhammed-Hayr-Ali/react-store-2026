import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { getCurrentUser } from "@/lib/actions/utils/profile"
import { getUserRole } from "@/lib/actions/utils/role-checker"
import { appConfig } from "@/lib/config/app_config"
import { getLocale } from "next-intl/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const currentUser = await getCurrentUser()
  const role = await getUserRole()
  const allowedRoles = appConfig.allowedRoles

  const side = locale === "ar" ? "right" : "left"

  // redirect to login page if user is not logged in
  if (!currentUser) {
    redirect("/auth/login")
  }

  //
  if (!allowedRoles.includes(role)) {
    redirect("/")
  }

  return (
    <SidebarProvider>
      <AppSidebar currentUser={currentUser} role={role} side={side} />
      {children}
    </SidebarProvider>
  )
}
