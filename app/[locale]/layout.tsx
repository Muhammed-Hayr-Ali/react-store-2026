import type { Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import "@/app/globals.css";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import {
  dmSans,
  geistMono,
  geistSans,
  rubik,
  comfortaa,
  urbanist,
} from "@/lib/config/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { CartCountProvider } from "@/lib/provider/cart-provider";
import { UserProvider } from "@/lib/provider/user-provider";
import { getTotalCartQuantity } from "@/lib/actions/cart";
import { getUser } from "@/lib/actions/get-user-action";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/ScrollToTop";
import { CurrencyProvider } from "@/lib/provider/currency-provider";
import { cookies } from "next/headers";
import { getRates } from "@/lib/actions/currency";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const isRtlLocale = (locale: string) => {
  return ["ar", "fa", "he", "ur"].includes(locale);
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const { data: initialCartCount } = await getTotalCartQuantity();
  const { data: initialUser } = await getUser();

  const rates = await getRates();
  const cookieStore = await cookies();
  const initialCurrencyCode =
    cookieStore.get("selected_currency")?.value || "USD";

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${dmSans.variable} ${geistSans.variable} ${geistMono.variable} ${rubik.variable} ${comfortaa.variable} ${urbanist.variable} antialiased`}
    >
      <body>
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ScrollToTop />
            <UserProvider initialUser={initialUser || null}>
              <CurrencyProvider
                initialRates={rates}
                initialCurrencyCode={initialCurrencyCode}
              >
                <CartCountProvider initialCount={initialCartCount || 0}>
                  <TooltipProvider>{children}</TooltipProvider>
                </CartCountProvider>
              </CurrencyProvider>
            </UserProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
