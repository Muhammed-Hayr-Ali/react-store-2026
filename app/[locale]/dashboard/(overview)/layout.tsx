import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function Layout({ children, params }: LayoutProps) {
  await params

  return (
    <SidebarInset className="flex min-h-screen w-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ms-1" />
          <Separator orientation="vertical" className="me-2 h-4 self-auto" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 md:px-6 md:py-6">{children}</main>
    </SidebarInset>
  )
}
