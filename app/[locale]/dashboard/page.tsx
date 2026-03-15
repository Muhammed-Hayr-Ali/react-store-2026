// app/[locale]/(account)/profile/page.tsx

import { getDashboardSummary } from "@/lib/actions/dashboard";
import { createServerClient } from "@/lib/supabase/createServerClient";
import { redirect } from "next/navigation";
import { IndexPage } from "@/components/dashboard";

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
