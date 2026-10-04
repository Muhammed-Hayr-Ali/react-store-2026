import { APP_NAME } from "@/lib/config/app_config"
import { AppLogo } from "../ui/app-logo"
import { Package, ShieldAlert, ShieldCheckIcon, UsersIcon, ZapIcon } from "lucide-react"

export const sidebarConfig = {
  teams: [
    {
      name: APP_NAME,
      logo: AppLogo,
      plan: "Admin Plan",
    },
  ],
  navMain: [
    {
      title: "Products",
      url: "/dashboard/products",
      icon: Package,
      isActive: false,
    },
    {
      title: "Flash Sales",
      url: "/dashboard/flash-sales",
      icon: ZapIcon,
      isActive: false,
    },
    {
      title: "Reports & Issues",
      url: "/dashboard/reports",
      icon: ShieldAlert,
    },
    {
      title: "Roles & Permissions",
      url: "/dashboard/roles",
      icon: ShieldCheckIcon,
      isActive: false,
    },
    {
      title: "Users Management",
      url: "/dashboard/users",
      icon: UsersIcon,
      isActive: false,
    },
  ],
}
