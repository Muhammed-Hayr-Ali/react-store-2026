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
import { PERMISSIONS, AppPermission } from "@/lib/actions/role"
import { APP_ROUTES } from "@/lib/config/app-routes"

// Define the shape of a dashboard navigation entry and its nested links.
export interface SidebarItem {
  key: string
  label: string
  url: string
  icon: LucideIcon
  requiredPermission?: AppPermission
  items?: {
    key: string
    label: string
    url: string
    requiredPermission?: AppPermission
  }[]
  hasSeparator?: boolean
}

// Group the sidebar's primary navigation entries.
interface SidebarConfig {
  MAV_MAIN: SidebarItem[]
}

// Configure the dashboard links and their access requirements.
export const SIDEBAR_CONFIG: SidebarConfig = {
  MAV_MAIN: [
    {
      key: "store",
      label: "STORE",
      url: APP_ROUTES.HOME,
      icon: StoreIcon,
    },
    {
      key: "overview",
      label: "OVERVIEW",
      url: APP_ROUTES.DASHBOARD.OVERVIEW,
      icon: LayoutDashboard,
    },
    {
      key: "categories-management",
      label: "CATEGORIES_MANAGEMENT",
      url: APP_ROUTES.DASHBOARD.CATEGORIES,
      icon: Tags,
      requiredPermission: PERMISSIONS.VIEW_CATEGORIES_DASHBOARD,
    },
    {
      key: "brands-management",
      label: "BRANDS_MANAGEMENT",
      url: APP_ROUTES.DASHBOARD.BRANDS,
      icon: Tags,
      requiredPermission: PERMISSIONS.VIEW_BRANDS_DASHBOARD,
    },
    {
      key: "products-management",
      label: "PRODUCTS_MANAGEMENT",
      url: APP_ROUTES.DASHBOARD.PRODUCTS,
      icon: PackageIcon,
      requiredPermission: PERMISSIONS.VIEW_PRODUCTS_DASHBOARD,
    },

    // --- 2. تمت إضافة قسم التقييمات هنا بعد المنتجات مباشرة ---
    {
      key: "reviews-management",
      label: "REVIEWS_MANAGEMENT",
      url: APP_ROUTES.DASHBOARD.REVIEWS, // تأكد أن هذا المسار موجود في appRoutes
      icon: MessageSquareIcon,
      requiredPermission: PERMISSIONS.VIEW_REVIEWS_DASHBOARD,
    },
    // -----------------------------------------------------------

    {
      key: "users-management",
      label: "USERS_MANAGEMENT",
      url: APP_ROUTES.DASHBOARD.USERS,
      icon: Users,
      requiredPermission: PERMISSIONS.VIEW_USERS_DASHBOARD,
    },
    {
      key: "newsletter-subscribers",
      label: "NEWSLETTER_SUBSCRIBERS",
      url: APP_ROUTES.DASHBOARD.NEWSLETTER_SUBSCRIBERS,
      icon: Mail,
      requiredPermission: PERMISSIONS.VIEW_NEWSLETTER_DASHBOARD,
    },

    {
      key: "team-management",
      label: "TEAM_MANAGEMENT",
      url: "#",
      icon: UserCog,
      requiredPermission: PERMISSIONS.VIEW_ROLES_DASHBOARD,
      items: [
        {
          key: "roles-and-permissions",
          label: "ROLES_AND_PERMISSIONS",
          url: APP_ROUTES.DASHBOARD.TEAM.ROLES,
        },
        {
          key: "staff-access",
          label: "STAFF_ACCESS",
          url: APP_ROUTES.DASHBOARD.TEAM.STAFF_ACCESS,
        },
      ],
    },
  ],
}
