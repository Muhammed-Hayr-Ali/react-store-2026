import {
  LayoutDashboard,
  Users,
  UserCog,
  type LucideIcon,
  StoreIcon,
  Tags,
  Mail,
  PackageIcon,
  MessageSquareIcon, // <-- 1. أضفنا هذه الأيقونة
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
      requiredPermission: PERMISSIONS.VIEW_CATEGORIES_DASHBOARD,
    },
    {
      titleKey: "BRANDS_MANAGEMENT",
      key: "brands-management",
      url: appRoutes.dashboard.brands,
      icon: Tags,
      requiredPermission: PERMISSIONS.VIEW_BRANDS_DASHBOARD,
    },
    {
      titleKey: "PRODUCTS_MANAGEMENT",
      key: "products-management",
      url: appRoutes.dashboard.products,
      icon: PackageIcon,
      requiredPermission: PERMISSIONS.VIEW_PRODUCTS_DASHBOARD,
    },

    // --- 2. تمت إضافة قسم التقييمات هنا بعد المنتجات مباشرة ---
    {
      titleKey: "REVIEWS_MANAGEMENT",
      key: "reviews-management",
      url: appRoutes.dashboard.reviews, // تأكد أن هذا المسار موجود في appRoutes
      icon: MessageSquareIcon,
      requiredPermission: PERMISSIONS.VIEW_REVIEWS_DASHBOARD,
    },
    // -----------------------------------------------------------

    {
      titleKey: "USERS_MANAGEMENT",
      key: "users-management",
      url: appRoutes.dashboard.users,
      icon: Users,
      requiredPermission: PERMISSIONS.VIEW_USERS_DASHBOARD,
    },
    {
      titleKey: "NEWSLETTER_SUBSCRIBERS",
      key: "newsletter-subscribers",
      url: appRoutes.dashboard.newsletterSubscribers,
      icon: Mail,
      requiredPermission: PERMISSIONS.VIEW_NEWSLETTER_DASHBOARD,
    },

    {
      titleKey: "TEAM_MANAGEMENT",
      key: "team-management",
      url: "#",
      icon: UserCog,
      requiredPermission: PERMISSIONS.VIEW_ROLES_DASHBOARD,
      items: [
        {
          titleKey: "ROLES_AND_PERMISSIONS",
          url: appRoutes.dashboard.team.roles,
        },
        {
          titleKey: "STAFF_ACCESS",
          url: appRoutes.dashboard.team.staffAccess,
        },
      ],
    },
  ],
}
