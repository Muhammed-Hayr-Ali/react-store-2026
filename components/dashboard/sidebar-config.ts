import {
  LayoutDashboard,
  Users,
  UserCog,
  type LucideIcon,
  StoreIcon,
  Tags,
  Mail,
} from "lucide-react"
import { appRoutes } from "@/lib/config/app-routes"
import { PERMISSIONS, AppPermission } from "@/lib/actions/role"

// Define the shape of a dashboard navigation entry and its nested links.
export interface SidebarItem {
  titleKey: string
  key: string
  url: string
  icon: LucideIcon
  requiredPermission?: AppPermission
  items?: {
    titleKey: string
    url: string
    requiredPermission?: AppPermission
  }[]
  hasSeparator?: boolean
}

// Group the sidebar's primary navigation entries.
interface SidebarConfig {
  navMain: SidebarItem[]
}

// Configure the dashboard links and their access requirements.
export const sidebarConfig: SidebarConfig = {
  navMain: [
    {
      titleKey: "STORE",
      key: "store",
      url: appRoutes.home,
      icon: StoreIcon,
    },
    {
      titleKey: "OVERVIEW",
      key: "overview",
      url: appRoutes.dashboard.overview,
      icon: LayoutDashboard,
    },
    {
      titleKey: "CATEGORIES_MANAGEMENT",
      key: "categories-management",
      url: appRoutes.dashboard.categories,
      icon: Tags,
      requiredPermission: PERMISSIONS.VIEW_CATEGORIES_MANAGEMENT,
    },
    {
      titleKey: "BRANDS_MANAGEMENT",
      key: "brands-management",
      url: appRoutes.dashboard.brands,
      icon: Tags,
      requiredPermission: PERMISSIONS.VIEW_BRANDS_MANAGEMENT,
    },
    {
      titleKey: "USERS_MANAGEMENT",
      key: "users-management",
      url: appRoutes.dashboard.users,
      icon: Users,
      requiredPermission: PERMISSIONS.VIEW_USERS_MANAGEMENT,
    },
    {
      titleKey: "NEWSLETTER_SUBSCRIBERS",
      key: "newsletter-subscribers",
      url: appRoutes.dashboard.newsletterSubscribers,
      icon: Mail,
      requiredPermission: PERMISSIONS.VIEW_NEWSLETTER_SUBSCRIBERS,
    },

    {
      titleKey: "TEAM_MANAGEMENT",
      key: "team-management",
      url: "#",
      icon: UserCog,
      items: [
        {
          titleKey: "ROLES_AND_PERMISSIONS",
          url: appRoutes.dashboard.team.roles,
          requiredPermission: PERMISSIONS.VIEW_ROLES_MANAGEMENT,
        },
        {
          titleKey: "STAFF_ACCESS",
          url: appRoutes.dashboard.team.staffAccess,
          requiredPermission: PERMISSIONS.VIEW_STAFF_ACCESS,
        },
      ],
    },
  ],
}
