/**
 * @file app/[locale]/(store)/layout.tsx
 * @description Main storefront layout with sticky top navbar, scrollable content, footer, and a Tailwind-gradient fading bottom navigation for mobile.
 */

import * as React from "react"
import Navbar from "@/components/store/navbar/navbar"
import Footer from "@/components/store/footer/footer"
import BottomNavigationBar from "@/components/store/bottom-navigation-bar/bottom-navigation-bar"

interface StoreLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* 1. Navbar is sticky at the top */}
      <Navbar />
      {/* 2. Main content area */}
      <main className="w-full flex-1 space-y-6 pt-4 pb-24 md:space-y-8 md:py-6 lg:py-8">
        {children}
      </main>
      {/* 3. Storefront Footer */}
      <Footer />
      {/* Mobile Floating Bottom Notch */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center bg-linear-to-t from-[#fafafa] via-[#FAFAFA]/80 to-transparent pt-6 pb-4 md:hidden dark:from-[#000000] dark:via-[#000000]/80 dark:to-transparent">
        <BottomNavigationBar />
      </div>
    </div>
  )
}
