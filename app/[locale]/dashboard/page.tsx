import { redirect } from "next/navigation"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { appRoutes } from "@/lib/config/app-routes"

export default async function DashboardEntryPage() {
  const canViewAdminOverview = await hasPermission(
    PERMISSIONS.VIEW_ADMIN_OVERVIEW
  )

  if (canViewAdminOverview) {
    redirect(appRoutes.dashboard.admin.overview)
  }

  const canViewDashboard = await hasPermission(PERMISSIONS.VIEW_USER_OVERVIEW)

  if (canViewDashboard) {
    redirect(appRoutes.dashboard.user.overview)
  }

  redirect(appRoutes.auth.login)
}
