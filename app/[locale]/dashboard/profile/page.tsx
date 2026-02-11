import ProfilePage from "@/components/dashboard/profile/ProfilePage";
import { createMetadata } from "@/lib/metadata";
import { createServerClient } from "@/lib/supabase/createServerClient";
import { redirect } from "next/navigation";

export const metadata = createMetadata({
  title: "My Profile",
  description: "Manage your account settings and personal information.",
});

export default async function Page() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/"); // إذا لم يكن المستخدم مسجلاً، أعد توجيهه
  }

  return <ProfilePage user={user} />;
}
