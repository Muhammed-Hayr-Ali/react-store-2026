"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "./ui/tooltip";
import { AppLogo } from "./custom-ui/app-logo";
import Link from "next/link";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { siteConfig } from "@/lib/config/site";



interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  data: { user?: SupabaseUser; role?: string[] } | undefined;
}


export function AppSidebar({ data, ...props }: AppSidebarProps) {
  const navMain = data?.role?.includes("admin")
    ? siteConfig.adminNavMain
    : siteConfig.userNavMain;
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          asChild
        >
          <Link href="/">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <AppLogo className="text-background" />
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <TooltipProvider>
          {/* <NavMain items={data.navMain} /> */}
          <NavMain
            label={data?.role?.includes("admin") ? "Admin" : "User"}
            items={navMain}
          />
        </TooltipProvider>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data?.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
