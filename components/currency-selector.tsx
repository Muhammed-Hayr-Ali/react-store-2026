// components/layout/currency-selector.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrencyContext } from "@/lib/provider/currency-provider";



export function CurrencySelector() {
  // استخدام الهوك للوصول إلى البيانات والوظائف من الـ Provider
  const { currency, supportedCurrencies, setCurrency } = useCurrencyContext();

  return (
    <Select value={currency.code} onValueChange={setCurrency}>
      <SelectTrigger className="w-auto border-none bg-transparent">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {supportedCurrencies.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
