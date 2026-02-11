import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export default function NotFoundRedirect() {
  // إعادة توجيه إلى اللغة الافتراضية
  redirect(`/${routing.defaultLocale}/not-found`);
}
