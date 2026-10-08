import { redirect } from "next/navigation"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { appRoutes } from "@/lib/config/app-routes"

export default async function DashboardEntryPage() {
  const canViewAdminOverview = await hasPermission(
    PERMISSIONS.VIEW_ADMIN_OVERVIEW
  )

  if (canViewAdminOverview) {
    redirect(appRoutes.dashboard.admin.home)
  }

  const canViewDashboard = await hasPermission(PERMISSIONS.VIEW_DASHBOARD)

  if (canViewDashboard) {
    redirect(appRoutes.dashboard.home)
  }

  redirect(appRoutes.auth.login)
}
