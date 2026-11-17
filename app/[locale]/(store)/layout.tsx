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
      <main className="w-full flex-1 space-y-5 pt-2 pb-24 md:space-y-8 md:py-6 lg:py-8">
        {children}
      </main>
      {/* 3. Storefront Footer */}
      <Footer />
      {/* Mobile Floating Bottom Notch */}
      <BottomNavigationBar />
    </div>
  )
}
