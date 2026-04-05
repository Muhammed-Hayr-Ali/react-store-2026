<<<<<<< HEAD
import { AuthGuard } from "@/lib/middleware/auth-guard";
import { appRouter } from "@/lib/navigation/routes";

/**
 * MFA Layout - تخطيط صفحات المصادقة الثنائية
 *
 * 🎯 الحماية:
 * - AuthGuard → يجب أن يكون المستخدم مسجل الدخول
 * - لا يوجد MfaGuard → لأن هذه الصفحات هي نفسها لإكمال MFA
 *
 * 📄 الصفحات:
 * - /verify → إدخال رمز MFA (للمستخدمين الذين لديهم MFA مفعل)
 * - /two-factor/setup → إعداد MFA لأول مرة
 */
export default async function MfaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      {/* يجب أن يكون المستخدم مسجل الدخول للوصول لصفحات MFA */}
      <AuthGuard redirectPath={appRouter.signIn} />
      {children}
    </main>
  );
=======
import { appRouter } from "@/lib/app-routes"
import { AuthGuard } from "@/lib/middleware/auth-guard"

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main>
      <AuthGuard redirectPath={appRouter.home} />
      {children}
    </main>
  )
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
}
