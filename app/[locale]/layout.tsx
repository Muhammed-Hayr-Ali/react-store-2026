<<<<<<< HEAD
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Geist_Mono, Inter, Cairo } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Toaster } from "sonner";
import { Viewport, Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/providers/auth-provider";
import { CsrfProvider } from "@/lib/providers/csrf-provider";
import { MfaGuard } from "@/lib/middleware/mfa-guard";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
=======
import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Geist_Mono, Inter, Cairo } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { routing } from "@/i18n/routing"
import { Toaster } from "sonner"
import { Viewport, Metadata } from "next"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/lib/providers/auth-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
<<<<<<< HEAD
});
=======
})
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
<<<<<<< HEAD
});
=======
})
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
<<<<<<< HEAD
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
};
=======
}

export const metadata: Metadata = {
  manifest: "/manifest.json",
}
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2

// kjl

export function generateStaticParams() {
<<<<<<< HEAD
  return routing.locales.map((locale) => ({ locale }));
=======
  return routing.locales.map((locale) => ({ locale }))
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
<<<<<<< HEAD
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();
=======
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const messages = await getMessages()
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        locale === "ar" ? cairo.variable : inter.variable,
<<<<<<< HEAD
        locale === "ar" ? "font-arabic" : "font-sans",
=======
        locale === "ar" ? "font-arabic" : "font-sans"
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <NextIntlClientProvider messages={messages}>
              <AuthProvider>
<<<<<<< HEAD
                <CsrfProvider>
                  {/* MFA Check - يحمي كل الصفحات المحمية */}
                  <MfaGuard />
                  {children}
                  <Toaster position="top-center" richColors />
                </CsrfProvider>
=======
                {children}
                <Toaster position="top-center" richColors />
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
              </AuthProvider>
            </NextIntlClientProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
}
