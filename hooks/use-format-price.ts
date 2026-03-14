// lib/hooks/use-format-price.ts
"use client";

import { useCurrencyContext } from "@/lib/provider/currency-provider"; // تأكد من أن المسار صحيح
import { useMemo } from "react";

/**
 * "هوك" مخصص لتنسيق الأسعار داخل مكونات العميل.
 * @param priceInCents السعر بالوحدة الأساسية (e.g., 1999)
 * @param locale رمز اللغة الحالي (e.g., "en", "ar", "tr")
 * @returns السعر المنسق كنص (e.g., "٧٥٫٠٠ ر.س.‏")
 */
export function useFormatPrice(priceInCents: number | null, locale: string): string {
  // 1. الوصول إلى العملة الحالية وأسعار الصرف من السياق
  const { currency, rates } = useCurrencyContext();

  // 2. استخدام useMemo لتحسين الأداء
  const formattedPrice = useMemo(() => {
    // إضافة تحقق للتأكد من أن المدخلات صالحة
    if (typeof priceInCents !== "number" || !rates || !currency) {
      return "";
    }

    const basePriceInUSD = priceInCents / 100;
    let finalPrice = basePriceInUSD;

    const currencyCodeUpper = currency.code.toUpperCase();

    if (currencyCodeUpper !== "USD" && currencyCodeUpper in rates) {
      finalPrice = basePriceInUSD * rates[currencyCodeUpper];
    }

    try {
      // ✅ الخطوة الرئيسية: استخدام متغير 'locale' هنا
      const formatter = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return formatter.format(finalPrice);
    } catch (error) {
      console.error(
        `Invalid currency code or locale: ${currency.code}, ${locale}`,
        error,
      );
      // إجراء احتياطي يعرض السعر بالدولار بالشكل القياسي
      return `$${basePriceInUSD.toFixed(2)}`;
    }
    // ✅ إضافة 'locale' إلى مصفوفة الاعتماديات
  }, [priceInCents, currency, rates, locale]);

  return formattedPrice;
}
