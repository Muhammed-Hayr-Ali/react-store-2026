import Link from "next/link"
import { getCurrentUser } from "@/lib/actions/utils/profile"
import { getNotifications } from "@/lib/actions/notifications/queries/get-notifications"
import { AppLogo } from "@/components/ui/app-logo"

import DesktopNav from "./desktop-nav"
import { MobileNav } from "./mobile-nav"
import type { NotificationRecord } from "@/lib/actions/notifications/types"

export default async function Navbar() {
  const [user, notificationsRes] = await Promise.all([
    getCurrentUser(),
    getNotifications(),
  ])

  const notifications: NotificationRecord[] =
    notificationsRes.success && notificationsRes.data
      ? notificationsRes.data.notifications
      : []
  const unreadCount =
    notificationsRes.success && notificationsRes.data
      ? notificationsRes.data.unreadCount
      : 0

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/60 backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex flex-1 items-center justify-start">
            <Link href="/" className="flex items-center">
              <AppLogo className="size-6" />
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end gap-4 md:gap-6">
            <DesktopNav
              user={user}
              initialNotifications={notifications}
              initialUnreadCount={unreadCount}
            />
            <MobileNav
              user={user}
              initialNotifications={notifications}
              initialUnreadCount={unreadCount}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}
