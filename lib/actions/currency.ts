// lib/currency.ts



import { cache } from "react";
import { createServerClient } from "../supabase/createServerClient";

// نستخدم 'cache' من React لضمان أننا لا نطلب البيانات من قاعدة البيانات
// إلا مرة واحدة فقط لكل طلب صفحة.
export const getRates = cache(async () => {



  const supabase = await createServerClient();


    const { data, error } = await supabase.from("exchange_rates").select("*");

  if (error) {
    console.error("Failed to fetch exchange rates", error);
    return {};
  }

  const rates = data.reduce(
    (acc, rate) => {
      acc[rate.currency_code] = rate.rate_from_usd;
      return acc;
    },
    {} as Record<string, number>,
  );

  return rates;
});

// تذكر: قم دائمًا بتخزين الأسعار كأعداد صحيحة (سنتات)
export async function formatPrice(
  priceInCents: number,
  targetCurrency: string,
) {
  const rates = await getRates();
  const basePriceInUSD = priceInCents / 100;

  let finalPrice = basePriceInUSD;

  if (
    targetCurrency.toUpperCase() !== "USD" &&
    rates[targetCurrency.toUpperCase()]
  ) {
    finalPrice = basePriceInUSD * rates[targetCurrency.toUpperCase()];
  }

  const formatter = new Intl.NumberFormat("ar", {
    // يمكنك تحديد اللغة ديناميكيًا
    style: "currency",
    currency: targetCurrency,
  });

  return formatter.format(finalPrice);
}
