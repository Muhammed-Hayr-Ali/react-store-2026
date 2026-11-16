import {
  type LucideIcon,
  HomeIcon,
  SearchIcon,
  ShoppingCartIcon,
  UserIcon,
  HeartIcon,
  LayoutDashboardIcon,
} from "lucide-react"
import { AppPermission, PERMISSIONS } from "@/lib/actions/role"
import { APP_ROUTES } from "@/lib/config/app-routes"

// Define the shape of a dashboard navigation entry and its nested links.
export interface BottomNavigationBar {
  key: string
  label: string
  url: string
  icon: LucideIcon
  requiredPermission?: AppPermission
}

// Configure the dashboard links and their access requirements.
export const BOTTOM_NAV_BAR: BottomNavigationBar[] = [
  {
    key: "home",
    label: "HOME",
    url: APP_ROUTES.HOME,
    icon: HomeIcon,
  },
  {
    key: "search",
    label: "SEARCH",
    url: APP_ROUTES.SEARCH,
    icon: SearchIcon,
  },
  {
    key: "wishlist",
    label: "WISHLIST",
    url: APP_ROUTES.WISHLIST,
    icon: HeartIcon,
  },
  {
    key: "cart",
    label: "CART",
    url: APP_ROUTES.CART,
    icon: ShoppingCartIcon,
  },
  {
    key: "account",
    label: "ACCOUNT",
    url: APP_ROUTES.ACCOUNT,
    icon: UserIcon,
  },
  {
    key: "dashboard",
    label: "DASHBOARD",
    url: APP_ROUTES.DASHBOARD.OVERVIEW,
    icon: LayoutDashboardIcon,
    requiredPermission:PERMISSIONS.VIEW_WISHLISTS_DASHBOARD
  },
]
