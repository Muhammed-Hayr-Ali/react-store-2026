import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumb } from "@/components/custom-ui/dynamic-breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getUserWithRole } from "@/lib/actions/get-user-action";
import { AuthGuard } from "@/lib/guards/auth-guard";
import { AuthProvider } from "@/lib/provider/auth-provider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const isRtlLocale = (locale: string) => {
  return ["ar", "fa", "he", "ur"].includes(locale);
};

export default async function Layout({ params, children }: Props) {

  const { locale } = await params;
  const side = isRtlLocale(locale) ? "right" : "left";
  const data = await getUserWithRole();  

  return (
    <AuthProvider>
      <AuthGuard />
      <SidebarProvider>
        <AppSidebar data={data.data} side={side}  />

        <SidebarInset className="flex flex-col h-screen">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <DynamicBreadcrumb />
          </header>

          <main className="flex-1 overflow-y-auto p-4 bg-muted/40">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}
