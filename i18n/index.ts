export const languages = {
  en: "English",
  ar: "العربية",
} as const;

export type Locale = keyof typeof languages;
