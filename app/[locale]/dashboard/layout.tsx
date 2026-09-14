import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { readRolesAndPermissions } from "@/lib/actions/role/read_role_permission"
import { getCurrentUser } from "@/lib/actions/utils/profile"
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


  const result = await readRolesAndPermissions()

  const userRole = result.success ? result.data.role : ""




  const allowedRoles = appConfig.allowedRoles

  const side = locale === "ar" ? "right" : "left"

  // redirect to login page if user is not logged in
  if (!currentUser) {
    redirect("/auth/login")
  }

  //
  if (!allowedRoles.includes(userRole)) {
    redirect("/")
  }

  return (
    <SidebarProvider>
      <AppSidebar currentUser={currentUser} role={userRole} side={side} />
      {children}
    </SidebarProvider>
  )
}
