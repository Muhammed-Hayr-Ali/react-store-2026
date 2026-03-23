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
import { useTranslations } from "next-intl"

export function NavSecondary({
  ...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const t = useTranslations("SidebarNav")
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

  const getStatusLabel = (status: string) => {
    return t(`planStatus.${status}`) || status
  }

  const getPlanName = (planName: string | undefined) => {
    if (!planName) return ""
    // تحويل اسم الخطة إلى مفتاح ترجمة (مثال: "Enterprise Seller" -> "enterprise_seller")
    const key = planName.toLowerCase().replace(/\s+/g, "_")
    return t(`planNames.${key}`) || planName
  }

  return (
    <SidebarGroup
      {...props}
      className="mt-auto group-data-[collapsible=icon]:hidden"
    >
      <SidebarGroupContent>
        <SidebarMenu>
          {/* اسم الخطة */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {getPlanName(activePlan.plan_name)}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* حالة الخطة */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-xs text-muted-foreground">
                  {getStatusLabel(activePlan.status)}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
