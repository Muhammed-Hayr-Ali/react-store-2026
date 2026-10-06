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
    {
      title: "Notifications",
      url: appRoutes.dashboard.notifications,
      icon: Bell,
      requiredPermission: PERMISSIONS.VIEW_NOTIFICATIONS,
    },
  ],
}

const adminSidebarConfig: SidebarConfig = {
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
      requiredPermission: PERMISSIONS.VIEW_PRODUCTS, // ربطها بصلاحية عرض المنتجات
    },
    {
      title: "Flash Sales",
      url: appRoutes.dashboard.admin.flashSales,
      icon: Zap,
      requiredPermission: PERMISSIONS.VIEW_FLASH_SALES, // ربطها بصلاحية عرض العروض
    },
    {
      title: "Users Management",
      url: appRoutes.dashboard.admin.users,
      icon: Users,
      requiredPermission: PERMISSIONS.VIEW_USERS, // ربطها بصلاحية عرض المستخدمين
    },
    {
      title: "Reports & Issues",
      url: appRoutes.dashboard.admin.reports,
      icon: FileSpreadsheet,
      requiredPermission: PERMISSIONS.VIEW_REPORTS, // ربطها بصلاحية عرض التقارير
    },
    {
      title: "Roles & Permissions",
      url: appRoutes.dashboard.admin.roles,
      icon: ShieldCheck,
      requiredPermission: PERMISSIONS.VIEW_USER_ROLES, // ربطها بصلاحية عرض الأدوار
    },
    {
      title: "Staff Access",
      url: appRoutes.dashboard.admin.staffAccess,
      icon: UserCog,
      requiredPermission: PERMISSIONS.ASSIGN_ROLE,
    },
    {
      title: "Notifications Management",
      url: appRoutes.dashboard.admin.notifications,
      icon: Bell,
      requiredPermission: PERMISSIONS.VIEW_NOTIFICATIONS,
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