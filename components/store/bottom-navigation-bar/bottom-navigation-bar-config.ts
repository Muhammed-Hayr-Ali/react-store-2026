import {
  type LucideIcon,
  HomeIcon,
  SearchIcon,
  ShoppingCartIcon,
  UserIcon,
  HeartIcon,
} from "lucide-react"
import { AppPermission } from "@/lib/actions/role"
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
    url: APP_ROUTES.DASHBOARD.OVERVIEW,
    icon: SearchIcon,
  },
  {
    key: "wishlist",
    label: "WISHLIST",
    url: APP_ROUTES.DASHBOARD.CATEGORIES,
    icon: HeartIcon,
  },
  {
    key: "cart",
    label: "CART",
    url: APP_ROUTES.DASHBOARD.BRANDS,
    icon: ShoppingCartIcon,
  },
  {
    key: "profile",
    label: "PROFILE",
    url: APP_ROUTES.DASHBOARD.PRODUCTS,
    icon: UserIcon,
  },
]
