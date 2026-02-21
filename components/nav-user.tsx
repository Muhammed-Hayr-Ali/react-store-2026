"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUserDisplay } from "@/hooks/useUserDisplay";
import { User } from "@supabase/supabase-js";

export function NavUser({ user }: { user: User | undefined }) {

  const { fullName, avatarUrl, email, initials } = useUserDisplay(user);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="hover:bg-transparent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left rtl:text-right text-sm leading-tight">
            <span className="truncate font-medium">{fullName}</span>
            <span className="truncate text-xs">{email}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
