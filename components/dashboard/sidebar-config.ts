import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  UserCog,
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
      title: "Overview",
      key: "overview",
      url: appRoutes.dashboard.overview,
      icon: LayoutDashboard,
    },
    {
      title: "Users Management",
      key: "users-management",
      url: appRoutes.dashboard.users,
      icon: Users,
      requiredPermission: PERMISSIONS.VIEW_USERS_MANAGEMENT,
    },
    {
      title: "Team Management",
      key: "team-management",
      url: "#",
      icon: UserCog,
      items: [
        {
          title: "Roles & Permissions",
          url: appRoutes.dashboard.team.roles,
          requiredPermission: PERMISSIONS.VIEW_ROLES_MANAGEMENT,
        },
        {
          title: "Staff Access",
          url: appRoutes.dashboard.team.staffAccess,
          requiredPermission: PERMISSIONS.VIEW_STAFF_ACCESS,
        },
      ],
    },
  ],
}
