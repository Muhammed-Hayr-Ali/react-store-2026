// components/ui/nav-link.tsx

"use client"; // هذا المكون يحتاج إلى استخدام hooks من جانب العميل

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // أداة مساعدة لدمج أسماء الفئات (classes)
import { buttonVariants } from "@/components/ui/button"; // سنستخدم تنسيقات الأزرار كنقطة بداية

interface NavLinkProps extends React.ComponentProps<typeof Link> {
  children: React.ReactNode;
  className?: string;
}

/**
 * مكون رابط تنقل (NavLink) يتغير تنسيقه بناءً على المسار الحالي.
 * هو يجمع بين <Link> من Next.js و usePathname hook.
 */
export function NavLink({ href, className, children, ...props }: NavLinkProps) {
  // 1. الحصول على المسار الحالي من URL
  // مثال: إذا كنت في "http://localhost:3000/settings/profile", فإن pathname سيكون "/settings/profile"
  const pathname = usePathname();

  // 2. التحقق مما إذا كان الرابط نشطًا
  // نقارن بداية المسار الحالي مع رابط المكون.
  // هذا يضمن أن الرابط "/settings" يبقى نشطًا حتى لو كنت في "/settings/profile".
  const isActive = pathname.startsWith(href.toString());

  return (
    <Link
      href={href}
      // 3. دمج الفئات (classes) بشكل ديناميكي
      className={cn(
        // نطبق تنسيق الزر "ghost" بشكل افتراضي لجميع الروابط
        buttonVariants({ variant: "ghost" }),
        // إذا كان الرابط نشطًا (isActive)، نطبق تنسيقات إضافية
        isActive
          ? "bg-muted hover:bg-muted" // خلفية رمادية فاتحة
          : "hover:bg-transparent hover:underline", // تأثير شفاف عند المرور
        // ندمج أي فئات إضافية يتم تمريرها عبر props
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
