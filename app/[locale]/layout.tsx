import type { Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import "@/app/globals.css";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import {
  almarai,
  dmSans,
  geistMono,
  geistSans,
  rubik,
  comfortaa,
  urbanist,
} from "@/lib/config/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/provider/auth-provider";
import { CartProvider } from "@/lib/provider/cart-provider";

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

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${dmSans.variable} ${geistSans.variable} ${geistMono.variable} ${almarai.variable} ${rubik.variable} ${comfortaa.variable} ${urbanist.variable} antialiased`}
    >
      <body>
        <NextIntlClientProvider>
          <AuthProvider>
            <CartProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
              </ThemeProvider>
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
