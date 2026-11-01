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
  navMain: SidebarItem[]
}

// Configure the dashboard links and their access requirements.
export const sidebarConfig: SidebarConfig = {
  navMain: [
    {
      key: "store",
      label: "STORE",
      url: appRoutes.home,
      icon: StoreIcon,
    },
    {
      key: "overview",
      label: "OVERVIEW",
      url: appRoutes.dashboard.overview,
      icon: LayoutDashboard,
    },
    {
      key: "categories-management",
      label: "CATEGORIES_MANAGEMENT",
      url: appRoutes.dashboard.categories,
      icon: Tags,
      requiredPermission: PERMISSIONS.VIEW_CATEGORIES_DASHBOARD,
    },
    {
      key: "brands-management",
      label: "BRANDS_MANAGEMENT",
      url: appRoutes.dashboard.brands,
      icon: Tags,
      requiredPermission: PERMISSIONS.VIEW_BRANDS_DASHBOARD,
    },
    {
      key: "products-management",
      label: "PRODUCTS_MANAGEMENT",
      url: appRoutes.dashboard.products,
      icon: PackageIcon,
      requiredPermission: PERMISSIONS.VIEW_PRODUCTS_DASHBOARD,
    },

    // --- 2. تمت إضافة قسم التقييمات هنا بعد المنتجات مباشرة ---
    {
      key: "reviews-management",
      label: "REVIEWS_MANAGEMENT",
      url: appRoutes.dashboard.reviews, // تأكد أن هذا المسار موجود في appRoutes
      icon: MessageSquareIcon,
      requiredPermission: PERMISSIONS.VIEW_REVIEWS_DASHBOARD,
    },
    // -----------------------------------------------------------

    {
      key: "users-management",
      label: "USERS_MANAGEMENT",
      url: appRoutes.dashboard.users,
      icon: Users,
      requiredPermission: PERMISSIONS.VIEW_USERS_DASHBOARD,
    },
    {
      key: "newsletter-subscribers",
      label: "NEWSLETTER_SUBSCRIBERS",
      url: appRoutes.dashboard.newsletterSubscribers,
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
          url: appRoutes.dashboard.team.roles,
        },
        {
          key: "staff-access",
          label: "STAFF_ACCESS",
          url: appRoutes.dashboard.team.staffAccess,
        },
      ],
    },
  ],
}
