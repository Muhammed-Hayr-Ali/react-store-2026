// app/page.tsx
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export default function HomeRedirect() {
  redirect(`/${routing.defaultLocale}/store/`);
}
