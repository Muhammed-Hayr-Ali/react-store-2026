import {
  LayoutDashboard,
  Package,
  Zap,
  Users,
  FileSpreadsheet,
  ShieldCheck,
  UserCog,
  Bell,
  type LucideIcon,
  StoreIcon,
} from "lucide-react"
import { appRoutes } from "@/lib/config/app-routes"
import { PERMISSIONS, AppPermission } from "@/lib/actions/role"

export interface SidebarItem {
  title: string
  key: string
  url: string
  icon: LucideIcon
  requiredPermission?: AppPermission
  items?: {
    title: string
    url: string
    requiredPermission?: AppPermission
  }[]
  hasSeparator?: boolean
}

interface SidebarConfig {
  navMain: SidebarItem[]
}

export const sidebarConfig: SidebarConfig = {
  navMain: [
    {
      title: "Store",
      key: "store",
      url: appRoutes.home,
      icon: StoreIcon,
    },
    {
      title: "Dashboard",
      key: "user-dashboard",
      url: appRoutes.dashboard.user.overview,
      icon: LayoutDashboard,
      requiredPermission: PERMISSIONS.VIEW_USER_OVERVIEW,
      hasSeparator: true,
    },
    {
      title: "Admin Dashboard",
      key: "admin-dashboard",
      url: appRoutes.dashboard.admin.overview,
      icon: ShieldCheck,
      requiredPermission: PERMISSIONS.VIEW_ADMIN_OVERVIEW,
    },
    {
      title: "Products",
      key: "products",
      url: appRoutes.dashboard.admin.products,
      icon: Package,
      requiredPermission: PERMISSIONS.VIEW_PRODUCTS,
    },
    {
      title: "Flash Sales",
      key: "flash-sales",
      url: appRoutes.dashboard.admin.flashSales,
      icon: Zap,
      requiredPermission: PERMISSIONS.VIEW_FLASH_SALES,
    },
    {
      title: "Users Management",
      key: "users-management",
      url: appRoutes.dashboard.admin.users,
      icon: Users,
      requiredPermission: PERMISSIONS.VIEW_USERS_MANAGEMENT,
    },
    {
      title: "Reports & Issues",
      key: "reports-issues",
      url: appRoutes.dashboard.admin.reports,
      icon: FileSpreadsheet,
      requiredPermission: PERMISSIONS.VIEW_REPORTS_MANAGEMENT,
    },
    {
      title: "Roles & Permissions",
      key: "roles-permissions",
      url: appRoutes.dashboard.admin.roles,
      icon: ShieldCheck,
      requiredPermission: PERMISSIONS.VIEW_ROLES_MANAGEMENT,
    },
    {
      title: "Staff Access",
      key: "staff-access",
      url: appRoutes.dashboard.admin.staffAccess,
      icon: UserCog,
      requiredPermission: PERMISSIONS.VIEW_STAFF_ACCESS,
    },
    {
      title: "Notifications Management",
      key: "notifications-management",
      url: appRoutes.dashboard.admin.notifications,
      icon: Bell,
      requiredPermission: PERMISSIONS.VIEW_NOTIFICATIONS_MANAGEMENT,
    },
  ],
}
