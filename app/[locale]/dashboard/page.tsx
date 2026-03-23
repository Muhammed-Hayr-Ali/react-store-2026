import { getUserRole } from "@/lib/actions/user/get_user_role"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  AdminDashboard,
  VendorDashboard,
  CustomerDashboard,
  DeliveryDashboard,
} from "@/components/dashboard"
import { roleNavData } from "@/lib/data/sidebar-data"
import { getDirectionData } from "@/lib/utils/direction"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"
import { appRouter } from "@/lib/app-routes"

export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.dashboard.title"),
    description: t("seo.dashboard.description"),
  })
}

export default async function Page() {
  const res = await getUserRole()

  if (!res) {
    redirect("/")
  }

  const role = res.role as "admin" | "vendor" | "customer" | "delivery"
  const t = await getTranslations("SidebarNav")

  // اختيار المكون بناءً على الدور
  const DashboardComponent =
    {
      admin: AdminDashboard,
      vendor: VendorDashboard,
      customer: CustomerDashboard,
      delivery: DeliveryDashboard,
    }[role] || CustomerDashboard

  // اختيار القوائم بناءً على الدور
  const navItems = roleNavData[role] || roleNavData.customer

  // الحصول على بيانات الاتجاه
  const { sidebarSide } = await getDirectionData()

  return (
    <SidebarProvider>
      <AppSidebar role={role} side={sidebarSide} navItems={navItems} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{t(`dashboard.${role}`)}</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={appRouter.dashboard}>
                    {t("dashboard.home")}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <DashboardComponent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
