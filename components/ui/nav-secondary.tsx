"use client"

import * as React from "react"
import { CreditCard, CheckCircle, AlertCircle, Sparkles } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/providers/auth-provider"

export function NavSecondary({
  ...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { profile, hasRole } = useAuth()

  // لا تعرض القسم للـ Admin
  if (hasRole("admin")) {
    return null
  }

  // الحصول على الخطة النشطة
  const activePlan = profile?.plans?.[0]

  // إذا لم تكن هناك خطة، لا تعرض القسم
  if (!activePlan) {
    return null
  }

  // حالة الخطة
  const getStatusIcon = () => {
    switch (activePlan.status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "trial":
        return <Sparkles className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-orange-500" />
    }
  }

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* اسم الخطة */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{activePlan.plan_name}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* حالة الخطة */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-xs text-muted-foreground capitalize">
                  {activePlan.status}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
