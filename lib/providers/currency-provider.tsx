// components/providers/currency-provider.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { siteConfig } from "../config/site_config";

// 1. تعريف أنواع البيانات التي سنتعامل معها
export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export type RatesMap = Record<string, number>; // { "SAR": 3.75, "EGP": 47.5 }

interface CurrencyContextType {
  currency: Currency;
  rates: RatesMap;
  supportedCurrencies: Currency[];
  setCurrency: (currencyCode: string) => void;
}

// 2. قائمة العملات المدعومة
const supportedCurrencies: Currency[] = siteConfig.supportedCurrencies;

// 3. إنشاء السياق (Context)
const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

// 4. إنشاء الـ Provider
interface CurrencyProviderProps {
  children: ReactNode;
  initialRates: RatesMap; // أسعار الصرف التي تم جلبها من الخادم
  initialCurrencyCode: string; // العملة الحالية التي تم جلبها من الخادم
}

export function CurrencyProvider({
  children,
  initialRates,
  initialCurrencyCode,
}: CurrencyProviderProps) {
  const router = useRouter();

  // استخدام useState لإدارة العملة الحالية على العميل
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(() => {
    return (
      supportedCurrencies.find((c) => c.code === initialCurrencyCode) ||
      supportedCurrencies[0]
    );
  });

  // دالة لتغيير العملة
  const handleSetCurrency = (newCode: string) => {
    const newCurrency = supportedCurrencies.find((c) => c.code === newCode);
    if (newCurrency) {
      setCurrentCurrency(newCurrency); // تحديث الحالة على العميل
      setCookie("selected_currency", newCode, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      // refresh the page using router navigation redirect
      router.refresh();
      // window.location.reload(); // إعادة تحميل الصفحة لتطبيق التغييرات على مستوى الخادم
    }
  };

  const value = {
    currency: currentCurrency,
    rates: initialRates, // توفير أسعار الصرف
    supportedCurrencies,
    setCurrency: handleSetCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

// 5. إنشاء "هوك" مخصص للوصول السهل إلى السياق
export function useCurrencyContext() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error(
      "useCurrencyContext must be used within a CurrencyProvider",
    );
  }
  return context;
}
