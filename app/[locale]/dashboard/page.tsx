import { redirect } from "next/navigation";
import { appRouter } from "@/lib/navigation";
import { createMetadata } from "@/lib/config/metadata_generator";
import { getTranslations } from "next-intl/server";
import { getUserRole } from "@/lib/actions/user";
import DashboardAdmin from "@/components/DashboardAdmin/dashboard-admin";
import DashboardSeller from "@/components/DashboardSeller/dashboard-seller";
import DashboardDriver from "@/components/DashboardDriver/dashboard-driver";
import DashboardCustomer from "@/components/DashboardCustomer/dashboard-customer";

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



  
   const role = await getUserRole()

  // غير مسجل دخول → صفحة تسجيل الدخول
  if (!role.success || !role.data) {
    return redirect(appRouter.signIn);
  }

  const roleCode = role.data.role_code;

  // ترتيب الأولوية: admin > seller > driver > customer
  if (roleCode.includes("admin")) {
    return <DashboardAdmin />;
  }

  if (roleCode.includes("vendor")) {
    return <DashboardSeller />;
  }

  if (roleCode.includes("delivery")) {
    return <DashboardDriver />;
  }

  if (roleCode.includes("customer")) {
    return <DashboardCustomer />;
  }

  return redirect(appRouter.home);
}
