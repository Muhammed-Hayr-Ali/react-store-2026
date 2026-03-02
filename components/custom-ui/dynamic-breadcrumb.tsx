// components/ui/DynamicBreadcrumb.tsx (أو المسار الصحيح)

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
} from "@/components/ui/breadcrumb";

// =================================================================
// ✅ الخطوة 1: تعريف الدالة المفقودة هنا
// =================================================================
const formatSegment = (segment: string): string => {
  // تجاهل UUIDs (معرفات فريدة)
  if (segment.match(/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i)) {
    return "Details"; // أو أي كلمة عامة تفضلها
  }
  // استبدال الشرطات بمسافات وجعل الحرف الأول من كل كلمة كبيرًا
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// =================================================================
// تعريف الأنواع والواجهات
// =================================================================
export interface BreadcrumbSegment {
  title: string;
  href?: string;
}

interface DynamicBreadcrumbProps {
  extraSegments?: BreadcrumbSegment[];
}

// =================================================================
// ✅ الخطوة 2: المكون الآن يمكنه العثور على الدالة واستخدامها
// =================================================================
export function DynamicBreadcrumb({
  extraSegments = [],
}: DynamicBreadcrumbProps) {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  const pathSegments = /^[a-z]{2}(-[A-Z]{2})?$/.test(segments[0])
    ? segments.slice(1)
    : segments;

  const displaySegments =
    extraSegments.length > 0 ? pathSegments.slice(0, -1) : pathSegments;

  return (
    <div className="container mx-auto my-6 px-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {displaySegments.map((segment, index) => {
            const href =
              "/" +
              segments
                .slice(0, index + (segments.length - pathSegments.length) + 1)
                .join("/");
            return (
              <Fragment key={href}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    {/* الآن هذا الاستدعاء سيعمل بنجاح */}
                    <Link href={href}>{formatSegment(segment)}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Fragment>
            );
          })}

          {extraSegments.map((segment, index) => {
            const isLast = index === extraSegments.length - 1;
            return (
              <Fragment key={segment.title}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{segment.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={segment.href!}>{segment.title}</Link>
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
