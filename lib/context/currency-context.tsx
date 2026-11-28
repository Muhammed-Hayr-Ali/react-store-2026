"use client"

/**
 * @file lib/context/currency-context.tsx
 * @description Currency selection, conversion from USD cents, and localized price formatting.
 */

import * as React from "react"
import type { AppLocale } from "@/i18n/routing"
import type { ExchangeRateRow } from "@/lib/actions/store/queries/get-exchange-rate"

export type SupportedCurrencyCode = "USD" | "SYP"

/** عملة يدعمها المتجر. */
export interface StoreCurrency {
  /** رمز العملة: `USD` أو `SYP`. */
  code: SupportedCurrencyCode
  /** اسم العملة بالإنجليزية. */
  name: string
  /** اسم العملة بالعربية. */
  name_ar: string
  /** الرمز المعروض بجانب السعر، حسب لغة الواجهة. */
  symbol: string
}

const USD: StoreCurrency = {
  code: "USD",
  name: "US Dollar",
  name_ar: "دولار أمريكي",
  symbol: "$",
}

const getStoreCurrencies = (locale: AppLocale): StoreCurrency[] => [
  USD,
  {
    code: "SYP",
    name: "Syrian Pound",
    name_ar: "ليرة سورية",
    symbol: locale === "ar" ? "ل.س" : "SYP",
  },
]

interface CurrencyContextType {
  /**
   * العملة المستخدمة فعلياً في العرض.
   * تعود إلى الدولار إذا اختيرت الليرة ولم يتوفر سعر صرف صالح.
   */
  currentCurrency: StoreCurrency
  /**
   * يغير العملة ويحفظ الاختيار في الكوكي `app_currency` لمدة سنة.
   * الرموز غير المدعومة يتم تجاهلها.
   *
   * @param code - رمز العملة، ولا يهم حجم الأحرف.
   */
  setCurrency: (code: string) => void
  /** كل العملات المتاحة، لبناء قائمة الاختيار. */
  currencies: StoreCurrency[]
  /** سعر الدولار بالليرة المعتمد للمتجر. قيمته `1` إذا لم يتوفر سعر؛ تحقق من `hasValidRate`. */
  storeRate: number
  /** هل يتوفر سعر صرف صالح (أكبر من صفر)؟ */
  hasValidRate: boolean
  /** سجل سعر الصرف كما ورد من قاعدة البيانات، أو `null`. */
  exchangeRateData: ExchangeRateRow | null
  /**
   * يحول سنتات الدولار إلى رقم بالعملة الحالية، دون تنسيق.
   * الليرة تقرب للأعلى إلى عدد صحيح.
   *
   * @param priceInCents - المبلغ بسنتات الدولار.
   * @returns المبلغ، أو `0` للقيم السالبة وغير الصالحة.
   */
  convertFromCents: (priceInCents: number) => number
  /**
   * سعر منسق **مع** رمز العملة، مثل `$12.50`.
   * لا تضف `currentCurrency.symbol` بعده.
   *
   * @param priceInCents - المبلغ بسنتات الدولار. أسعار قاعدة البيانات مخزنة بالسنتات، فمررها كما هي دون ضرب.
   */
  formatPrice: (priceInCents: number) => string
  /**
   * سعر منسق **بدون** رمز العملة، لعرض الرمز بتصميم مستقل عبر `currentCurrency.symbol`.
   *
   * @param priceInCents - المبلغ بسنتات الدولار. أسعار قاعدة البيانات مخزنة بالسنتات، فمررها كما هي دون ضرب.
   */
  formatRawPrice: (priceInCents: number) => string
}

const CurrencyContext = React.createContext<CurrencyContextType | undefined>(
  undefined
)

interface CurrencyProviderProps {
  children: React.ReactNode
  exchangeRateData: ExchangeRateRow | null
  defaultCurrencyCode?: string
  locale: AppLocale
}

/**
 * يوفر العملة الحالية ودوال تحويل الأسعار وتنسيقها لكل المكونات الفرعية.
 */
export function CurrencyProvider({
  children,
  exchangeRateData,
  defaultCurrencyCode = "USD",
  locale,
}: CurrencyProviderProps) {
  // سعر الصرف المعتمد للمتجر (المقرب للأعلى في قاعدة البيانات)
  const rate = Number(exchangeRateData?.store_rate ?? 0)
  const hasValidRate = Number.isFinite(rate) && rate > 0
  const storeRate = hasValidRate ? rate : 1

  // نخزن الرمز فقط، حتى يتحدث رمز العملة عند تغير اللغة
  const [selectedCode, setSelectedCode] = React.useState(() =>
    defaultCurrencyCode.toUpperCase()
  )

  const currencies = React.useMemo(() => getStoreCurrencies(locale), [locale])

  const setCurrency = React.useCallback(
    (code: string) => {
      const normalized = code.toUpperCase()
      if (!currencies.some((c) => c.code === normalized)) return
      setSelectedCode(normalized)
      document.cookie = `app_currency=${normalized}; path=/; max-age=31536000; SameSite=Lax`
    },
    [currencies]
  )

  // دون سعر صرف صالح نعرض الدولار، بدل مبلغ دولاري عليه رمز الليرة
  const selected = currencies.find((c) => c.code === selectedCode) ?? USD
  const currentCurrency =
    selected.code === "SYP" && !hasValidRate ? USD : selected
  const isSyp = currentCurrency.code === "SYP"

  const convertFromCents = React.useCallback(
    (priceInCents: number): number => {
      if (!Number.isFinite(priceInCents) || priceInCents <= 0) return 0

      if (isSyp) {
        // الضرب قبل القسمة: (110 / 100) * 100 يعطي 110.00000000000001 فيقرب إلى 111
        return Math.ceil((priceInCents * storeRate) / 100)
      }

      return Math.round(priceInCents) / 100
    },
    [isSyp, storeRate]
  )

  // إنشاء المنسق مكلف، لذلك ننشئه مرة واحدة لكل عملة ولغة
  const formatters = React.useMemo(() => {
    const numberLocale = isSyp && locale === "ar" ? "ar-SY" : "en-US"
    const decimals = isSyp ? 0 : 2
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }

    return {
      raw: new Intl.NumberFormat(numberLocale, options),
      full: isSyp
        ? null
        : new Intl.NumberFormat("en-US", {
            ...options,
            style: "currency",
            currency: "USD",
          }),
    }
  }, [isSyp, locale])

  const formatRawPrice = React.useCallback(
    (priceInCents: number) =>
      formatters.raw.format(convertFromCents(priceInCents)),
    [formatters, convertFromCents]
  )

  const formatPrice = React.useCallback(
    (priceInCents: number) => {
      const amount = convertFromCents(priceInCents)
      return formatters.full
        ? formatters.full.format(amount)
        : `${formatters.raw.format(amount)} ${currentCurrency.symbol}`
    },
    [formatters, convertFromCents, currentCurrency.symbol]
  )

  const value = React.useMemo<CurrencyContextType>(
    () => ({
      currentCurrency,
      setCurrency,
      currencies,
      storeRate,
      hasValidRate,
      exchangeRateData,
      convertFromCents,
      formatPrice,
      formatRawPrice,
    }),
    [
      currentCurrency,
      setCurrency,
      currencies,
      storeRate,
      hasValidRate,
      exchangeRateData,
      convertFromCents,
      formatPrice,
      formatRawPrice,
    ]
  )

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

/**
 * العملة الحالية وأدوات الأسعار.
 *
 * - `currentCurrency` / `currencies` / `setCurrency`: عرض العملة وتغييرها.
 * - `formatPrice`: سعر مع رمز العملة.
 * - `formatRawPrice`: سعر بدون رمز.
 * - `convertFromCents`: الرقم بعد التحويل.
 * - `storeRate` / `hasValidRate` / `exchangeRateData`: بيانات سعر الصرف.
 *
 * **كل الدوال تستقبل سنتات الدولار، وهي الوحدة المخزنة في قاعدة البيانات.**
 *
 * @example
 * const { formatPrice } = useCurrency()
 * formatPrice(variant.price) // القيمة 200 تعرض "$2.00"
 *
 * @throws {Error} إذا استخدم خارج `CurrencyProvider`.
 */
export function useCurrency(): CurrencyContextType {
  const context = React.useContext(CurrencyContext)
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}
