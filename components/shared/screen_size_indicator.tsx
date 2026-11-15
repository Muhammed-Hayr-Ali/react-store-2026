export default function ScreenSizeIndicator() {
  // يظهر فقط في بيئة التطوير
  if (process.env.NODE_ENV === "production") return null

  return (
    <div className="fixed bottom-4 left-4 z-50 rounded-full bg-black/80 px-3 py-1.5 font-mono text-xs text-white shadow-lg backdrop-blur-md">
      <span className="inline sm:hidden">Default (&lt;640px)</span>
      <span className="hidden sm:inline md:hidden">sm (≥640px)</span>
      <span className="hidden md:inline lg:hidden">md (≥768px)</span>
      <span className="hidden lg:inline xl:hidden">lg (≥1024px)</span>
      <span className="hidden xl:inline 2xl:hidden">xl (≥1280px)</span>
      <span className="hidden 2xl:inline">2xl (≥1536px)</span>
    </div>
  )
}
