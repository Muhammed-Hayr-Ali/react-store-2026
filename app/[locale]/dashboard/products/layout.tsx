import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { notFound } from "next/navigation"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const canView = await hasPermission(PERMISSIONS.VIEW_PRODUCTS_MANAGEMENT)
  if (!canView) {
    notFound()
  }

  return { children }
}
