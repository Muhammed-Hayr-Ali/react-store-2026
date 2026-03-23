import { getLocale } from "next-intl/server"

/**
 * اتجاهات اللغة المدعومة
 */
const RTL_LOCALES = ["ar", "fa", "he", "ur"] as const

type RtlLocale = (typeof RTL_LOCALES)[number]

/**
 * يتحقق مما إذا كانت اللغة RTL
 */
export const isRtlLocale = (locale: string): locale is RtlLocale => {
  return RTL_LOCALES.includes(locale as RtlLocale)
}

/**
 * يحصل على اتجاه الـ layout بناءً على اللغة
 * @returns "rtl" أو "ltr"
 */
export const getLayoutDirection = (locale: string): "rtl" | "ltr" => {
  return isRtlLocale(locale) ? "rtl" : "ltr"
}

/**
 * يحصل على اتجاه الـ sidebar بناءً على اللغة
 * في الـ RTL يكون sidebar على اليمين، وفي LTR على اليسار
 * @returns "right" أو "left"
 */
export const getSidebarSide = (locale: string): "left" | "right" => {
  return isRtlLocale(locale) ? "right" : "left"
}

/**
 * يحصل على اتجاه النص بناءً على اللغة
 */
export const getTextDirection = (locale: string): "rtl" | "ltr" => {
  return getLayoutDirection(locale)
}

/**
 * بيانات الاتجاه للـ layout
 */
export interface DirectionData {
  dir: "rtl" | "ltr"
  sidebarSide: "left" | "right"
  isRtl: boolean
  locale: string
}

/**
 * يحصل على جميع بيانات الاتجاه دفعة واحدة
 */
export const getDirectionData = async (): Promise<DirectionData> => {
  const locale = await getLocale()
  const isRtl = isRtlLocale(locale)

  return {
    dir: isRtl ? "rtl" : "ltr",
    sidebarSide: isRtl ? "right" : "left",
    isRtl,
    locale,
  }
}
