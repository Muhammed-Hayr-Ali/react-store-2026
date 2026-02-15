"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
  LayoutDashboard,
  User,
  UserCog,
  Settings,
  MapPin,
  MessageSquareQuote,
  Heart,
  Package,
  ShoppingCart,
} from "lucide-react";
import { TooltipProvider } from "./ui/tooltip";
import { AppLogo } from "./custom-ui/app-logo";
import Link from "next/link";

// This is sample data.
const data = {
  // teams: [
  //   {
  //     name: "Acme Inc",
  //     logo: <GalleryVerticalEndIcon />,
  //     plan: "Enterprise",
  //   },
  //   {
  //     name: "Acme Corp.",
  //     logo: <AudioLinesIcon />,
  //     plan: "Startup",
  //   },
  //   {
  //     name: "Evil Corp.",
  //     logo: <TerminalIcon />,
  //     plan: "Free",
  //   },
  // ],
  // navMain: [
  //   {
  //     title: "Playground",
  //     url: "#",
  //     icon: <TerminalSquareIcon />,
  //     isActive: true,
  //   },
  //   {
  //     title: "Models",
  //     url: "#",
  //     icon: <BotIcon />,
  //     items: [
  //       {
  //         title: "Genesis",
  //         url: "#",
  //       },
  //       {
  //         title: "Explorer",
  //         url: "#",
  //       },
  //       {
  //         title: "Quantum",
  //         url: "#",
  //       },
  //     ],
  //   },
  //   {
  //     title: "Documentation",
  //     url: "#",
  //     icon: <BookOpenIcon />,
  //     items: [
  //       {
  //         title: "Introduction",
  //         url: "#",
  //       },
  //       {
  //         title: "Get Started",
  //         url: "#",
  //       },
  //       {
  //         title: "Tutorials",
  //         url: "#",
  //       },
  //       {
  //         title: "Changelog",
  //         url: "#",
  //       },
  //     ],
  //   },
  //   {
  //     title: "Settings",
  //     url: "#",
  //     icon: <Settings2Icon />,
  //     items: [
  //       {
  //         title: "General",
  //         url: "#",
  //       },
  //       {
  //         title: "Team",
  //         url: "#",
  //       },
  //       {
  //         title: "Billing",
  //         url: "#",
  //       },
  //       {
  //         title: "Limits",
  //         url: "#",
  //       },
  //     ],
  //   },
  // ],

  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboard />,
      isActive: true,
    },
    {
      title: "New Product",
      url: "/admin-dashboard/products/add",
      icon: <Package />,
    },
    {
      title: "My Cart",
      url: "/cart",
      icon: <ShoppingCart />,
    },
    {
      title: "Wishlist",
      url: "/wishlist",
      icon: <Heart />,
    },
    {
      title: "My Reviews",
      url: "/dashboard/reviews",
      icon: <MessageSquareQuote />,
    },
    {
      title: "Addresses",
      url: "/dashboard/addresses",
      icon: <MapPin />,
    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: <User />,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: <Settings />,
    },
  ],
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: <FrameIcon />,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: <PieChartIcon />,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: <MapIcon />,
  //   },
  // ],
};

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
          <NavMain items={data.navMain} />
        </TooltipProvider>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={null} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
