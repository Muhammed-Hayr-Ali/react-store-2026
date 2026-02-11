import { Skeleton } from "@/components/ui/skeleton";

// مكون فرعي لتقليد بطاقة عنوان واحدة
function AddressCardSkeleton() {
  return (
    <div className="border rounded-xl flex flex-col">
      {/* 1. الهيكل العظمي لرأس البطاقة */}
      <div className="p-4 border-b bg-muted/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* يطابق أيقونة العنوان */}
          <Skeleton className="h-5 w-5 rounded-full" />
          {/* يطابق اسم العنوان */}
          <Skeleton className="h-6 w-32" />
        </div>
        {/* يطابق شارة العنوان (اختياري) */}
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* 2. الهيكل العظمي لجسم البطاقة */}
      <div className="p-6 space-y-2 grow">
        {/* يطابق اسم الشخص */}
        <Skeleton className="h-5 w-1/2" />
        {/* يطابق سطور العنوان */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* 3. الهيكل العظمي لذيل البطاقة (الأزرار) */}
      <div className="p-4 border-t bg-muted/50 flex justify-end gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

// هذا هو مكون التحميل الذي سيتم عرضه تلقائيًا لصفحة العناوين
export default function AddressesLoading() {
  return (
    <div>
      {/* الهيكل العظمي لعنوان الصفحة وزر الإضافة */}
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>

      {/* الهيكل العظمي لشبكة العناوين */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 
          نكرر الهيكل العظمي 2 أو 4 مرات لإعطاء انطباع بوجود شبكة.
          4 يبدو جيدًا هنا.
        */}
        <AddressCardSkeleton />
        <AddressCardSkeleton />
        <AddressCardSkeleton />
        <AddressCardSkeleton />
      </div>
    </div>
  );
}
