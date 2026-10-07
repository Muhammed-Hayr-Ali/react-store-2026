import Navbar from "@/components/store/navbar/navbar"
import Footer from "@/components/store/footer/footer"
import { CurrencyProvider } from "@/lib/context/currency-context"
import { getCurrencyContext } from "@/lib/actions/currency/queries/get-currency-context"

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { currency, rate } = await getCurrencyContext()

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pt-14">
        <CurrencyProvider currency={currency} rate={rate}>
          {children}
        </CurrencyProvider>
      </main>
      <Footer />
    </div>
  )
}
