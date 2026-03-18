// // i18n/request.ts
// import { getRequestConfig } from "next-intl/server"
// import { routing } from "./routing"

// export default getRequestConfig(async ({ requestLocale }) => {
//   const locale = (await requestLocale) || routing.defaultLocale

//   const messages = (await import(`@/messages/${locale}.json`)).default

//   return {
//     locale,
//     messages,
//   }
// })

import { getRequestConfig } from "next-intl/server"
import { hasLocale } from "next-intl"
import { routing } from "./routing"

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  const messages = (await import(`@/messages/${locale}.json`)).default

  return {
    locale,
    messages,
  }
})
