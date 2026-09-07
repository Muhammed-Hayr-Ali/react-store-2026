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
    <main>
      <Navbar user={user} />
       {children}
       <Footer />
    </main>
  )
}
