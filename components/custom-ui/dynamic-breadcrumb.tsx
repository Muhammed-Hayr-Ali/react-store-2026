"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"; // استيراد المكونات من shadcn/ui

// دالة مساعدة لتحويل الكلمات إلى شكل أجمل (e.g., "probook-x1" -> "Probook X1")
const formatSegment = (segment: string) => {
  // تجاهل UUIDs (معرفات فريدة)
  if (segment.match(/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i)) {
    return "Details"; // أو أي كلمة عامة تفضلها
  }
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export function DynamicBreadcrumb() {
  const pathname = usePathname();

  // لا تعرض أي شيء إذا كنا في الصفحة الرئيسية
  if (pathname === "/") {
    return null;
  }

  // تقسيم المسار إلى أجزاء وتجاهل الجزء الأول الفارغ
  const segments = pathname.split("/").filter(Boolean);

  // تجاهل الجزء الأول إذا كان رمز اللغة (مثل "en" أو "ar")
  const pathSegments = /^[a-z]{2}(-[A-Z]{2})?$/.test(segments[0])
    ? segments.slice(1)
    : segments;

  // لا تعرض أي شيء إذا لم تكن هناك أجزاء قابلة للعرض
  if (pathSegments.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto my-6 px-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {pathSegments.map((segment, index) => {
            const href =
              "/" +
              segments
                .slice(0, index + (segments.length - pathSegments.length) + 1)
                .join("/");
            const isLast = index === pathSegments.length - 1;

            return (
              <Fragment key={href}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={href}>{formatSegment(segment)}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
