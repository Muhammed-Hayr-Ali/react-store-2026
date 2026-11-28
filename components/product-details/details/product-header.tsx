/**
 * @file components/store/product-details/details/product-header.tsx
 * @description Apple-inspired minimalist product title.
 */

interface ProductHeaderProps {
  name: string
}

export function ProductHeader({ name }: ProductHeaderProps) {
  return (
    // dir="auto" لأن جدول products لا يحتوي على ترجمة، فقد تختلف لغة النص عن لغة الواجهة
    <h1
      dir="auto"
      className="text-2xl leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-3xl lg:text-4xl"
    >
      {name}
    </h1>
  )
}
