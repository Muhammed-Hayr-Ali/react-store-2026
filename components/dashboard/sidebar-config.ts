import {
  LayoutDashboard,
  Package,
  Zap,
  Users,
  FileSpreadsheet,
  ShieldCheck,
  UserCog,
  Bell,
} from "lucide-react"
import { appRoutes } from "@/lib/config/app-routes"

export const sidebarConfig = {
  navMain: [
    {
      title: "Overview",
      url: appRoutes.dashboard.admin.home,
      icon: LayoutDashboard,
    },
    {
      title: "Products",
      url: appRoutes.dashboard.admin.products,
      icon: Package,
    },
    {
      title: "Flash Sales",
      url: appRoutes.dashboard.admin.flashSales,
      icon: Zap,
    },
    {
      title: "Users Management",
      url: appRoutes.dashboard.admin.users,
      icon: Users,
    },
    {
      title: "Reports & Issues",
      url: appRoutes.dashboard.admin.reports,
      icon: FileSpreadsheet,
    },
    {
      title: "Roles & Permissions",
      url: appRoutes.dashboard.admin.roles,
      icon: ShieldCheck,
    },
    {
      title: "Staff Access",
      url: appRoutes.dashboard.admin.staffAccess,
      icon: UserCog,
    },
    {
      title: "Notifications",
      url: appRoutes.dashboard.admin.notifications,
      icon: Bell,
    },
  ],
}
