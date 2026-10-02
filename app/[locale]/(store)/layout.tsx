import Footer from "@/components/layout/footer/footer"
import Navbar from "@/components/layout/navbar/navbar"
import { getCurrentUser } from "@/lib/actions/utils/profile"

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      {/* شريط التنقل العلوي */}
      <Navbar user={user} />

      {/* 
        الحاوية الرئيسية:
        - flex-1: تدفع الفوتر لأسفل الصفحة حتى لو كان المحتوى قصيراً
        - pt-16 إلى pt-20: تمنع اختفاء الجزء العلوي خلف شريط التنقل المثبت
      */}
      <main className="flex-1 pt-16 sm:pt-20">{children}</main>

      {/* تذييل الصفحة */}
      <Footer />
    </div>
  )
}
