 import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/* أدوات وأنماط مشتركة بين مكوّنات الهيدر (كانت مكررة في 4 ملفات)             */
/* -------------------------------------------------------------------------- */

const RTL_LOCALES = ["ar", "fa", "ur", "he"]

/** مصدر واحد لتحديد الاتجاه (كان بعض الملفات يقارن مع "ar" فقط) */
export const isRtlLocale = (locale: string) => RTL_LOCALES.includes(locale)

/** حلقة تركيز للعناصر المستقلة (أزرار وروابط الهيدر) */
export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/** حلقة تركيز داخلية لعناصر القوائم (لا تُقصّ داخل الـ Popover) */
export const menuFocusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"

/** زر المحددات الثلاثة (العملة / اللغة / المظهر) */
export const selectorTriggerClass = (compact = false, disabled = false) =>
  cn(
    "flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 text-xs font-normal text-foreground/85 transition-colors hover:bg-muted hover:text-foreground",
    compact ? "h-8" : "h-9",
    focusRing,
    disabled && "pointer-events-none opacity-70"
  )

/** عنصر القائمة داخل الـ Popover (حجم خط موحّد 13px) */
export const menuItemClass = (isSelected = false) =>
  cn(
    "group flex min-h-9 w-full items-center justify-between gap-2.5 rounded-md px-2.5 py-1.5 text-start text-[13px] font-normal transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60",
    menuFocusRing,
    isSelected ? "bg-muted/70 text-primary" : "text-foreground/85"
  )

/** أزرار الصف العلوي: الحساب / المفضلة / السلة */
export const headerActionClass = cn(
  "flex h-10 items-center gap-2 rounded-xl px-3 text-[13px] font-normal text-foreground/85 transition-colors hover:bg-muted/60 hover:text-primary",
  focusRing
)

/** روابط الصف الثاني: الأحدث / المميز */
export const navLinkClass = cn(
  "hidden h-9 items-center rounded-lg px-2.5 text-foreground/80 transition-colors hover:bg-muted/60 hover:text-primary md:flex",
  focusRing
)

/** إخفاء شريط التمرير في كل المتصفحات (scrollbar-none ليست أداة افتراضية في Tailwind v4) */
export const hideScrollbar =
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"

  