import {
  LayoutDashboard,
  Package,
  Zap,
  FileSpreadsheet,
  ShieldCheck,
  UserCog,
} from "lucide-react"
import { appRoutes } from "@/lib/config/app-routes"

export const sidebarConfig = {
  navMain: [
    {
      title: "Overview",
      url: appRoutes.dashboard.home,
      icon: LayoutDashboard,
    },
    {
      title: "Products",
      url: appRoutes.dashboard.products.allProducts,
      icon: Package,
    },
    {
      title: "Flash Sales",
      url: appRoutes.dashboard.flashSales,
      icon: Zap,
    },
    {
      title: "Reports & Issues",
      url: appRoutes.dashboard.reports,
      icon: FileSpreadsheet,
    },
    {
      title: "Roles & Permissions",
      url: appRoutes.dashboard.roles,
      icon: ShieldCheck,
    },
    {
      title: "Staff Access",
      url: appRoutes.dashboard.staffAccess,
      icon: UserCog,
    },
  ],
}
