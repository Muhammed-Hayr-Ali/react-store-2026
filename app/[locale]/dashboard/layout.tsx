import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import DashboardBreadcrumb from "@/components/dashboard/dashboard-breadcrumb"
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
      {/* الحاوية الموحدة لجميع صفحات لوحة التحكم */}
      <SidebarInset className="flex min-h-screen w-full flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ms-1" />
            <Separator orientation="vertical" className="me-2 h-4 self-auto" />
            {/* يقرأ مسار الصفحة الحالية تلقائياً ويبني الـ Breadcrumb */}
            <DashboardBreadcrumb />
          </div>
        </header>

        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
