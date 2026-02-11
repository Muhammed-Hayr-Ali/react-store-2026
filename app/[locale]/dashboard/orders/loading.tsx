import { Skeleton } from "@/components/ui/skeleton";

// هذا هو مكون التحميل الذي سيتم عرضه تلقائيًا لصفحة "طلباتي"
export default function OrdersLoading() {
  return (
    <div>
      {/* الهيكل العظمي لعنوان الصفحة */}
      <Skeleton className="h-9 w-48 mb-8" />

      <div className="space-y-4">
        {/* 
          نكرر الهيكل العظمي لبطاقة الطلب 3 مرات 
          لإعطاء انطباع بأننا نحمل قائمة.
        */}
        {[...Array(3)].map((_, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="grow">
                <div className="flex items-center gap-4 mb-2">
                  {/* يطابق "Order #12345" */}
                  <Skeleton className="h-7 w-40" />
                  {/* يطابق شارة الحالة */}
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                {/* يطابق تاريخ الطلب */}
                <Skeleton className="h-5 w-56" />
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                {/* يطابق السعر الإجمالي */}
                <Skeleton className="h-7 w-28" />
                {/* يطابق أيقونة السهم (اختياري، يمكن إزالته) */}
                <Skeleton className="h-6 w-6 rounded-full hidden sm:block" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
