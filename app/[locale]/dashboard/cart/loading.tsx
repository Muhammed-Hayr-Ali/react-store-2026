import { Skeleton } from "@/components/ui/skeleton";

// مكون فرعي لتقليد بطاقة منتج واحدة في السلة
function CartItemSkeleton() {
  return (
    <div className="flex gap-4 border-b pb-6">
      {/* يطابق صورة المنتج */}
      <Skeleton className="h-24 w-24 shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div className="space-y-2">
            {/* يطابق اسم المنتج */}
            <Skeleton className="h-6 w-48" />
            {/* يطابق خيارات المنتج */}
            <Skeleton className="h-4 w-32" />
          </div>
          {/* يطابق السعر */}
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex items-center justify-between mt-auto">
          {/* يطابق محدد الكمية */}
          <Skeleton className="h-8 w-28 rounded-md" />
          {/* يطابق زر الحذف */}
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}

// هذا هو مكون التحميل الذي سيتم عرضه تلقائيًا لصفحة السلة
export default function CartLoading() {
  return (
    <main className="container mx-auto">
      {/* يطابق عنوان الصفحة */}
      <Skeleton className="h-9 w-64 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* --- الهيكل العظمي لقائمة المنتجات --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* نكرر الهيكل العظمي 3 مرات لإعطاء انطباع بوجود قائمة */}
          <CartItemSkeleton />
          <CartItemSkeleton />
          <CartItemSkeleton />
        </div>
        {/* --- الهيكل العظمي لملخص الطلب --- */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 space-y-4">
            {/* يطابق عنوان "Order Summary" */}
            <Skeleton className="h-7 w-40 mb-4" />
            {/* يطابق صفوف الأسعار */}
            <div className="flex justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <hr className="my-2" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            {/* يطابق زر "Checkout" */}
            <Skeleton className="h-12 w-full mt-4" />
          </div>
        </div>
      </div>
    </main>
  );
}
