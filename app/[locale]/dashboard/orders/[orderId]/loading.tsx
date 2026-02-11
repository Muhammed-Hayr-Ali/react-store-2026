import { Skeleton } from "@/components/ui/skeleton";

// هذا هو مكون التحميل الذي سيتم عرضه تلقائيًا
export default function OrderDetailsLoading() {
  return (
    <div>
      {/* --- الهيكل العظمي للعنوان العلوي --- */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          {/* يطابق "Order Details" */}
          <Skeleton className="h-9 w-64" />
          {/* يطابق "Order #12345" */}
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
        <div className="flex items-center gap-2">
          {/* يطابق "Status: Processing" */}
          <Skeleton className="h-7 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- الهيكل العظمي للعمود الرئيسي --- */}
        <div className="lg:col-span-2 space-y-8">
          {/* --- الهيكل العظمي لملخص المنتجات --- */}
          <div className="border rounded-lg p-6">
            {/* يطابق "Items Ordered" */}
            <Skeleton className="h-7 w-40 mb-6" />
            <div className="space-y-4">
              {/* تكرار هيكل منتج واحد مرتين أو ثلاث لإعطاء انطباع بوجود قائمة */}
              {[...Array(2)].map((_, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start gap-4"
                >
                  <div className="flex-1 space-y-2">
                    {/* يطابق اسم المنتج */}
                    <Skeleton className="h-5 w-3/4" />
                    {/* يطابق الكمية */}
                    <Skeleton className="h-4 w-16" />
                  </div>
                  {/* يطابق السعر */}
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          </div>

          {/* --- الهيكل العظمي لملخص الأسعار --- */}
          <div className="border rounded-lg p-6">
            {/* يطابق "Price Summary" */}
            <Skeleton className="h-7 w-44 mb-6" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
              <hr className="my-2" />
              <div className="flex justify-between">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-7 w-24" />
              </div>
            </div>
          </div>
        </div>

        {/* --- الهيكل العظمي للعمود الجانبي --- */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6">
            {/* يطابق "Shipping Address" */}
            <Skeleton className="h-7 w-48 mb-6" />
            <div className="space-y-2">
              {/* يطابق اسم العميل */}
              <Skeleton className="h-5 w-3/5" />
              {/* يطابق سطر العنوان */}
              <Skeleton className="h-5 w-4/5" />
              {/* يطابق المدينة والولاية */}
              <Skeleton className="h-5 w-3/4" />
              {/* يطابق الدولة */}
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
