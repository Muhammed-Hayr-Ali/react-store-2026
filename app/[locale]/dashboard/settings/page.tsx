import SettingsPage from "@/components/dashboard/settings/settings-page";
import { getUser } from "@/lib/actions/get-user-action";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Settings",
  description: "Manage your account settings and Security.",
});

export default async function Page() {

  const user = await getUser();
  const email = user?.email || null;  

  return <SettingsPage email={email} />;
}
