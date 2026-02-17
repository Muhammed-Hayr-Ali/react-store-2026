import { DynamicBreadcrumb } from "@/components/custom-ui/dynamic-breadcrumb";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { RolesGuard } from "@/lib/guards/roles-guard";
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

  return (
    <>
      <RolesGuard roleNames="admin" />

      <AuthProvider>
        <SidebarProvider>
          <DashboardSidebar side={side} />

          {/* ✅ 1. تحويل SidebarInset إلى حاوية Flex عمودية تأخذ ارتفاع الشاشة بالكامل */}
          <SidebarInset className="flex flex-col h-screen">
            {/* ✅ 2. الهيدر: يبقى في الأعلى ولا يتمدد */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              />
              <DynamicBreadcrumb />
            </header>

            {/* ✅ 3. المحتوى الرئيسي (الأطفال): يأخذ المساحة المتبقية ويكون هو القابل للتمرير */}
            <main className="flex-1 overflow-y-auto p-4 bg-muted">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </AuthProvider>
    </>
  );
}
