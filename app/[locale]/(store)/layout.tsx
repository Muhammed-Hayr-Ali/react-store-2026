import Footer from "@/components/layout/footer/footer"
import Navbar from "@/components/store/navbar/navbar"
import { getCurrentUser } from "@/lib/actions/utils/profile"

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      {/* شريط التنقل العلوي بارتفاع h-14 */}
      <Navbar user={user} />

      {/* 
        الحاوية الرئيسية:
        - pt-14: تعويض دقيق ومطابق بنسبة 100% لارتفاع الناف بار الثابت (h-14 = 56px)
        - flex-1: إبقاء الفوتر في الأسفل
      */}
      <main className="flex-1 pt-14">{children}</main>

      {/* تذييل الصفحة */}
      <Footer />
    </div>
  )
}
