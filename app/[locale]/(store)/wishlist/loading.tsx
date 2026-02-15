import { Skeleton } from "@/components/ui/skeleton";

// مكون لتقليد بطاقة منتج واحدة
function WishlistItemSkeleton() {
  return (
    <div className="border bg-card rounded-xl overflow-hidden flex flex-col">
      {/* يطابق صورة المنتج */}
      <Skeleton className="aspect-square w-full" />
      <div className="flex flex-col grow">
        {/* يطابق اسم المنتج */}
        <Skeleton className="h-5 w-3/4 mb-2" />
        {/* يطابق السعر */}
        <Skeleton className="h-6 w-1/2" />
        {/* يطابق زر الإضافة للسلة */}
        <div className="mt-auto pt-4">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

// مكون التحميل الرئيسي لصفحة المفضلة
export default function WishlistLoading() {
  return (
    <main className="container mx-auto min-h-[50vh] px-4 mb-8">
      {/* يطابق عنوان الصفحة */}
      <Skeleton className="h-9 w-48" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 py-6">
        {/* ✅ التحسين: عرض عدد مناسب من الهياكل العظمية (e.g., 8) */}
        {[...Array(8)].map((_, index) => (
          <WishlistItemSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}
