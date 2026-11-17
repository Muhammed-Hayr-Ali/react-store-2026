import { AppPermission } from "@/lib/actions/role"
import { APP_ROUTES } from "@/lib/config/app-routes"
import {
  HomeIcon,
  SearchIcon,
  FavoriteIcon,
  ProfileIcon,
} from "@/components/store/bottom-navigation-bar/bottom-navbar-icons" // استبدل المسار بمكان ملف الأيقونات الخاص بك

// 1. تحديث شكل الأيقونة لتتوافق مع مكوناتنا المخصصة (تستقبل status كـ boolean وتعود بـ JSX.Element أو ElementType)
export interface BottomNavigationBar {
  key: string
  label: string
  url: string
  icon: React.ElementType<{
    status?: boolean
    size?: "default" | "xs" | "sm" | "md" | "lg"
  }>
  requiredPermission?: AppPermission
}

// 2. تكوين روابط شريط التنقل السفلي باستخدام أيقوناتنا المخصصة
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
    icon: FavoriteIcon, 
  },
  {
    key: "account",
    label: "ACCOUNT",
    url: APP_ROUTES.ACCOUNT,
    icon: ProfileIcon,
  },
]
