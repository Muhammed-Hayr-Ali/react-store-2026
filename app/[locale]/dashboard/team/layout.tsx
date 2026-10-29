import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { notFound } from "next/navigation"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const canView = await hasPermission(PERMISSIONS.MANAGE_ROLES)
  if (!canView) {
    notFound()
  }

  return { children }
}
