"use client"

import React, { useMemo, Fragment } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { NAV_LINKS } from "./nav-config"
import { useUser } from "@/lib/context/user-context"
import { cn } from "@/lib/utils"

interface NavItemsListProps {
  onItemClick?: () => void
  itemClassName?: string
  subItemClassName?: string
  iconClassName?: string
}

export function NavItemsList({
  onItemClick,
  itemClassName,
  subItemClassName,
  iconClassName = "size-4",
}: NavItemsListProps) {
  const { user, hasPermission } = useUser()

  const accessibleLinks = useMemo(() => {
    return NAV_LINKS
      .filter((item) => {
        if (!item.requiredPermission) return true
        if (!user) return false
        return hasPermission(item.requiredPermission)
      })
      .map((item) => {
        if (item.items) {
          return {
            ...item,
            items: item.items.filter((sub) => {
              if (!sub.requiredPermission) return true
              if (!user) return false
              return hasPermission(sub.requiredPermission)
            }),
          }
        }
        return item
      })
      .filter((item) => !item.items || item.items.length > 0)
  }, [user, hasPermission])

  return (
    <div className="flex flex-col">
      {accessibleLinks.map((item, index) => {
        const hasChildren = Boolean(item.items && item.items.length > 0)
        const isLastItem = index === accessibleLinks.length - 1

        return (
          <Fragment key={item.key}>
            {hasChildren ? (
              <Collapsible className="group/collapsible">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex h-10 w-full items-center justify-between font-normal",
                      itemClassName
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon
                        className={cn("me-2 text-muted-foreground", iconClassName)}
                      />
                      <span>{item.title}</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-0.5 ps-5 pt-0.5">
                  {item.items?.map((subItem) => (
                    <Button
                      key={subItem.title}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "flex h-8 w-full items-center justify-start text-xs font-normal text-muted-foreground hover:text-foreground",
                        subItemClassName
                      )}
                      asChild
                    >
                      <Link href={subItem.url} onClick={onItemClick}>
                        {subItem.title}
                      </Link>
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <Button
                variant="ghost"
                className={cn(
                  "flex h-10 w-full items-center justify-start font-normal",
                  itemClassName
                )}
                asChild
              >
                <Link href={item.url} onClick={onItemClick}>
                  <item.icon
                    className={cn("me-2 text-muted-foreground", iconClassName)}
                  />
                  {item.title}
                </Link>
              </Button>
            )}

            {item.hasSeparator && !isLastItem && (
              <div
                role="separator"
                aria-orientation="horizontal"
                className="my-1.5 h-px bg-border"
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}