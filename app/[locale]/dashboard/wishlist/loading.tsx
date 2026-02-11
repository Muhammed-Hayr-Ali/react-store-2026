import { Skeleton } from "@/components/ui/skeleton";

// ✅ --- مكون فرعي لتقليد بطاقة المنتج بنفس بنية البطاقات الأخرى --- ✅
function WishlistItemSkeleton() {
  return (
    // ✅ --- تم استبدال التصميم القديم ببنية البطاقة القياسية --- ✅
    <div className="border rounded-lg overflow-hidden flex flex-col">
      {/* يطابق صورة المنتج */}
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 flex flex-col flex-grow">
        {/* يطابق اسم المنتج */}
        <Skeleton className="h-6 w-3/4" />
        {/* يطابق السعر */}
        <Skeleton className="h-7 w-1/2 mt-2" />
        {/* يطابق زر الحذف */}
        <div className="mt-auto pt-4">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

// هذا هو مكون التحميل الذي سيتم عرضه تلقائيًا لصفحة قائمة الرغبات
export default function WishlistLoading() {
  return (
    <div>
      {/* يطابق عنوان الصفحة */}
      <Skeleton className="h-9 w-48 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* 
          نكرر الهيكل العظمي 8 مرات لإعطاء انطباع بوجود شبكة منتجات.
        */}
        {[...Array(8)].map((_, index) => (
          <WishlistItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
