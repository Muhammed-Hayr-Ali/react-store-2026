import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { hasRole } from "@/lib/actions/role/role-checker"
import { getCurrentUser } from "@/lib/actions/utils/profile"
import { getLocale } from "next-intl/server"
import { notFound, redirect } from "next/navigation"



export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {


    const has_role = await hasRole("admin")
    if (!has_role) {
      return notFound() 
    }

  const locale = await getLocale()

  const currentUser = await getCurrentUser()

  
  const side = locale === "ar" ? "right" : "left"

  // redirect to login page if user is not logged in
  if (!currentUser) {
    redirect("/auth/login")
  }

  //

  
  return (
    <SidebarProvider>
      <AppSidebar currentUser={currentUser} role={currentUser.role} side={side} />
      {children}
    </SidebarProvider>
  )
}
