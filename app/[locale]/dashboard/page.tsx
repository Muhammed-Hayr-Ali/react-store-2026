// app/[locale]/(account)/profile/page.tsx

import { IndexPage } from "@/components/features/dashboard";
import { getDashboardSummary } from "@/lib/actions/dashboard";
import { createServerClient } from "@/lib/supabase/createServerClient";
import { redirect } from "next/navigation";

export default async function DashboardSummary() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }


  const data = await getDashboardSummary();

  return (
    <>
      <IndexPage user={user} dashboardSummary={data.data} />
    </>
  );
}
