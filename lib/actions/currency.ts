// lib/actions/currency.ts
"use server"; // مهم جدًا: هذه دالة خادم

import { cache } from "react";
import { createServerClient } from "../supabase/createServerClient";

type RatesMap = Record<string, number>;

export const getRates = cache(async (): Promise<RatesMap> => {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("exchange_rates")
    .select("currency_code, rate_from_usd");

  if (error) {
    console.error("Error fetching exchange rates:", error);
    return {};
  }

  return data.reduce((acc, rate) => {
    acc[rate.currency_code] = rate.rate_from_usd;
    return acc;
  }, {} as RatesMap);
});
