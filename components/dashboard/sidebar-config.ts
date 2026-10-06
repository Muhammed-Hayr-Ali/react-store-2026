import {
  LayoutDashboard,
  Package,
  Zap,
  Users,
  FileSpreadsheet,
  ShieldCheck,
  UserCog,
  Bell,
  User,
  type LucideIcon,
} from "lucide-react"
import { appRoutes } from "@/lib/config/app-routes"
import { PERMISSIONS, AppPermission } from "@/lib/actions/role"

export interface SidebarItem {
  title: string
  url: string
  icon: LucideIcon
  requiredPermission?: AppPermission
  items?: {
    title: string
    url: string
    requiredPermission?: AppPermission
  }[]
}
import { ROLES } from "@/lib/actions/role/types"

interface SidebarConfig {
  navMain: SidebarItem[]
}

const userSidebarConfig: SidebarConfig = {
  navMain: [
    { title: "Overview", url: appRoutes.dashboard.home, icon: LayoutDashboard },
    { title: "My Account", url: appRoutes.dashboard.account, icon: User },
   
  ],
}


  // VIEW_DASHBOARD: "view_dashboard",
  // VIEW_OVERVIEW: "view_overview",
  // VIEW_PRODUCTS: "view_products",
  // VIEW_FLASH_SALES: "view_flash_sales",
  // VIEW_USERS_MANAGEMENT: "view_users_management",
  // VIEW_REPORTS_AND_ISSUES: "view_reports_and_issues",
  // VIEW_ROLES_AND_PERMISSIONS: "view_roles_and_permissions",
  // VIEW_STAFF_ACCESS: "view_staff_access",
  // VIEW_NOTIFICATIONS_MANAGEMENT: "view_notifications_management",




const adminSidebarConfig: SidebarConfig = {
  navMain: [
    {
      title: "Dashboard",
      url: appRoutes.dashboard.home,
      icon: LayoutDashboard,
      requiredPermission: PERMISSIONS.VIEW_DASHBOARD,
    },
    {
      title: "Overview",
      url: appRoutes.dashboard.admin.home,
      icon: Package,
      requiredPermission: PERMISSIONS.VIEW_OVERVIEW,
    },
    {
      title: "Products",
      url: appRoutes.dashboard.admin.products,
      icon: Package,
      requiredPermission: PERMISSIONS.VIEW_PRODUCTS,
    },
    {
      title: "Flash Sales",
      url: appRoutes.dashboard.admin.flashSales,
      icon: Zap,
      requiredPermission: PERMISSIONS.VIEW_FLASH_SALES,
    },
    {
      title: "Users Management",
      url: appRoutes.dashboard.admin.users,
      icon: Users,
      requiredPermission: PERMISSIONS.VIEW_USERS_MANAGEMENT,
    },
    {
      title: "Reports and Issues",
      url: appRoutes.dashboard.admin.reports,
      icon: FileSpreadsheet,
      requiredPermission: PERMISSIONS.VIEW_REPORTS_AND_ISSUES,
    },
    {
      title: "Roles and Permissions",
      url: appRoutes.dashboard.admin.roles,
      icon: ShieldCheck,
      requiredPermission: PERMISSIONS.VIEW_ROLES_AND_PERMISSIONS,
    },
    {
      title: "Staff Access",
      url: appRoutes.dashboard.admin.staffAccess,
      icon: UserCog,
      requiredPermission: PERMISSIONS.VIEW_STAFF_ACCESS,
    },
    {
      title: "Notifications Management",
      url: appRoutes.dashboard.admin.notifications,
      icon: Bell,
      requiredPermission: PERMISSIONS.VIEW_NOTIFICATIONS_MANAGEMENT,
    },
   

   
 
  ],
}

const roleSidebarMap: Record<string, SidebarConfig> = {
  [ROLES.ADMIN]: adminSidebarConfig,
}

export function getSidebarConfigByRole(role?: string | null): SidebarConfig {
  if (!role) return userSidebarConfig
  return roleSidebarMap[role] || userSidebarConfig
}