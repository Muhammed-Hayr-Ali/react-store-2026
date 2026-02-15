import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

// ===============================================================================
// مكون فرعي لتقليد بطاقة منتج واحدة (مطابق للتصميم الجديد)
// ===============================================================================
function CartItemSkeleton() {
  return (
    // يطابق التصميم الجديد: خلفية، حواف دائرية، ومسافات داخلية
    <div className="relative flex gap-4 bg-muted/50 p-2 lg:p-4 rounded-lg">
      {/* يطابق صورة المنتج */}
      <Skeleton className="h-24 w-24 shrink-0 rounded-md" />

      <div className="flex flex-1 flex-col justify-between">
        {/* القسم العلوي: اسم المنتج */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" /> {/* يطابق اسم المنتج */}
          <Skeleton className="h-4 w-32" /> {/* يطابق خيارات المنتج */}
        </div>

        {/* القسم السفلي: السعر ومحدد الكمية */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" /> {/* يطابق السعر */}
          {/* يطابق محدد الكمية الدائري الجديد */}
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>

      {/* يطابق زر الحذف الجديد في الزاوية */}
      <Skeleton className="absolute top-2 right-2 h-8 w-8" />
    </div>
  );
}

// ===============================================================================
// مكون التحميل الرئيسي لصفحة السلة
// ===============================================================================
export default function CartLoading() {
  return (
    <main className="container mx-auto min-h-[50vh] px-4 mb-8">
      {/* يطابق عنوان الصفحة */}
      <Skeleton className="h-8 w-48" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12 py-6">
        {/* --- الهيكل العظمي لقائمة المنتجات --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* نكرر الهيكل العظمي 3 مرات لإعطاء انطباع بوجود قائمة */}
          <CartItemSkeleton />
          <CartItemSkeleton />
          <CartItemSkeleton />
        </div>

        {/* --- الهيكل العظمي لملخص الطلب (مطابق لتصميم Card) --- */}
        <div className="lg:col-span-1">
          <Card className="bg-muted/50">
            <CardHeader>
              <Skeleton className="h-7 w-40" /> {/* يطابق CardTitle */}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* يطابق صفوف الأسعار */}
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex justify-between pt-2 border-t border-dashed">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-32" />
              </div>
              {/* يطابق المجموع الإجمالي */}
              <div className="flex justify-between pt-4 border-t border-dashed">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-7 w-24" />
              </div>
            </CardContent>
            <CardFooter>
              {/* يطابق زر "Checkout" */}
              <Skeleton className="h-12 w-full" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
