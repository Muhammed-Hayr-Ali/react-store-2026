/**
 * @file app/[locale]/(store)/layout.tsx
 * @description Main storefront layout with sticky top navbar, scrollable content, footer, and a Tailwind-gradient fading bottom navigation for mobile.
 */

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // الحاوية الجذرية: تستخدم flex لضمان بقاء الفوتر في الأسفل، وتدعم الثيمات الفاتحة والداكنة
    <div className="relative flex min-h-screen flex-col bg-background text-foreground antialiased">
      {/* 1. رابط تخطي إلى المحتوى (معيار عالمي للوصول - Accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:inset-s-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        تخطي إلى المحتوى الرئيسي
      </a>

      {children}
    </div>
  )
}
