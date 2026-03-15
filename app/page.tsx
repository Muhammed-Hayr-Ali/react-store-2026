// app/page.tsx
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export default function HomeRedirect() {
  // Redirect to coming soon page
  redirect(`/${routing.defaultLocale}/coming-soon`);
}
