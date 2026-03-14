"use client";

import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";

interface ContentProps {
  html: string;
  className?: string;
}

export function Content({ html, className }: ContentProps) {
  // 1. تنظيف الـ HTML من أي سكربتات خبيثة محتملة
  const cleanHtml = DOMPurify.sanitize(html);

  // 2. عرض المحتوى مع كلاسات Tailwind Typography
  return (
    <div
      className={cn(
        "prose prose-sm sm:prose dark:prose-invert max-w-none",
        "prose-p:my-1.5 prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}
