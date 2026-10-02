"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

export function ScrollToTop() {
  const pathname = usePathname()

  React.useEffect(() => {
    // إعادة التمرير للنافذة الرئيسية
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })

    // في حال كان التمرير داخل عنصر body أو html أو حاوية مخصصة
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])

  return null
}
