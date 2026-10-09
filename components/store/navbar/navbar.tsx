import Link from "next/link"
import { AppLogo } from "@/components/ui/app-logo"

import DesktopNavbar from "./desktop-navbar"
import { MobileMenu } from "./mobile-menu"
import type { NotificationRecord } from "@/lib/actions/notifications/types"
import { getNotifications } from "@/lib/actions/notifications"

export default async function Navbar() {
  const notificationsRes = await getNotifications()

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
            <DesktopNavbar
              initialNotifications={notifications}
              initialUnreadCount={unreadCount}
            />
            <MobileMenu
              initialNotifications={notifications}
              initialUnreadCount={unreadCount}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}
