import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { getCurrentUserStatus } from "@/lib/actions/users/queries/get-current-user-status"
import { getCurrentUser } from "@/lib/actions/utils/profile"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()

  // التحقق من حالة الحساب عبر الدالة المخصصة
  const { isAuthenticated, status } = await getCurrentUserStatus()

  if (isAuthenticated && status === "banned") {
    redirect(`/${locale}/banned`)
  }

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
