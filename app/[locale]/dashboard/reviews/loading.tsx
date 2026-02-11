import { Skeleton } from "@/components/ui/skeleton";

// مكون فرعي لتقليد بطاقة تقييم واحدة
function UserReviewSkeleton() {
  return (
    <div className="border rounded-lg p-4 flex flex-col sm:flex-row items-start gap-4">
      {/* يطابق صورة المنتج */}
      <Skeleton className="h-28 w-28 rounded-md shrink-0" />
      <div className="flex-1 space-y-2">
        {/* يطابق اسم المنتج */}
        <Skeleton className="h-6 w-3/4" />
        {/* يطابق النجوم والتاريخ */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        {/* يطابق عنوان التقييم */}
        <Skeleton className="h-5 w-1/2 mt-2" />
        {/* يطابق نص التقييم */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      {/* يطابق زر الحذف/التعديل */}
      <div className="w-full sm:w-auto mt-2 sm:mt-0">
        <Skeleton className="h-9 w-full sm:w-24" />
      </div>
    </div>
  );
}

// هذا هو مكون التحميل الذي سيتم عرضه تلقائيًا لصفحة "تقييماتي"
export default function MyReviewsLoading() {
  return (
    <div className="space-y-6">
      {/* يطابق عنوان الصفحة */}
      <Skeleton className="h-8 w-40" />

      <div className="space-y-4">
        {/* 
          نكرر الهيكل العظمي 3 مرات لإعطاء انطباع بوجود قائمة من التقييمات.
        */}
        <UserReviewSkeleton />
        <UserReviewSkeleton />
        <UserReviewSkeleton />
      </div>
    </div>
  );
}
