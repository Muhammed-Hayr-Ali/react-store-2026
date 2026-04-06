import { redirect } from "next/navigation";
import { checkUserRoles } from "@/lib/middleware/dashboard-permission-guard";
import { appRouter } from "@/lib/navigation";
import DashboardCustomer from "@/components/dashboard/dashboard-customer";
import DashboardSeller from "@/components/dashboard/dashboard-seller";
import DashboardDriver from "@/components/dashboard/dashboard-driver";
import DashboardAdmin from "@/components/dashboard/dashboard-admin";
import { createMetadata } from "@/lib/config/metadata_generator";
import { getTranslations } from "next-intl/server";

// =====================================================
// 🧭 Dashboard Router (URL موحد — لا يظهر الدور في الرابط)
// =====================================================

export async function generateMetadata() {
  const t = await getTranslations();

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.dashboard.title"),
    description: t("seo.dashboard.description"),
  });
}

export default async function DashboardPage() {
  const session = await checkUserRoles();

  // غير مسجل دخول → صفحة تسجيل الدخول
  if (!session) {
    return redirect(appRouter.signIn);
  }

  const { roles } = session;

  // ترتيب الأولوية: admin > seller > driver > customer
  if (roles.includes("admin")) {
    return <DashboardAdmin />;
  }

  if (roles.includes("vendor")) {
    return <DashboardSeller />;
  }

  if (roles.includes("delivery")) {
    return <DashboardDriver />;
  }

  if (roles.includes("customer")) {
    return <DashboardCustomer />;
  }

  // ما عنده أي دور → unauthorized
  return redirect("/unauthorized");
}
