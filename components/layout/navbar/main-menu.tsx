import { appConfig } from "@/lib/config/app_config"
import { cn } from "@/lib/utils"

import Link from "next/link"

interface mainNavbarMenuProps {
  className?: string
}

export function MainNavbarMenu({ className }: mainNavbarMenuProps) {
  return (
    <div className={cn("hidden justify-center md:flex", className)}>
      <div className="flex space-x-3.5">
        {appConfig.menu.mainNavbarMenu.items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="flex items-start px-3 py-2 text-xs"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
