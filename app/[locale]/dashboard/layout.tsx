import { getLocale } from "next-intl/server"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import DashboardBreadcrumb from "@/components/dashboard/dashboard-breadcrumb"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const side = locale === "ar" ? "right" : "left"

  // جلب بيانات المستخدم وصلاحياته على السيرفر لمرة واحدة

  return (
      <SidebarProvider>
        {/* الـ AppSidebar يعالج جلب بياناته وصلاحياته ذاتياً على السيرفر */}
        <AppSidebar side={side} />

        <SidebarInset className="flex min-h-screen w-full flex-col">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ms-1" />
              <Separator
                orientation="vertical"
                className="me-2 h-4 self-auto"
              />

              <DashboardBreadcrumb />
            </div>
          </header>

          <main className="flex-1 px-4 py-4 md:px-6 md:py-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
   
  )
}
