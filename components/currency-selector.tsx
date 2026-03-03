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
      <SelectTrigger className="text-xs shadow-none border-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {supportedCurrencies.map((c) => (
          <SelectItem
            key={c.code}
            value={c.code}
            className="text-xs"
          >
            {c.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
