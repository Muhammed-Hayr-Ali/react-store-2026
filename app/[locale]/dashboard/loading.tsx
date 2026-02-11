import { Skeleton } from "@/components/ui/skeleton";

// هذا هو مكون التحميل الذي سيتم عرضه تلقائيًا لصفحة "حسابي"
export default function ProfileDashboardLoading() {
  return (
    <div className="space-y-8">
      {/* --- الهيكل العظمي لبطاقة الترحيب --- */}
      <div className="p-6 bg-muted/30 border rounded-lg">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-5 w-3/4 mt-2" />
      </div>

      {/* --- الهيكل العظمي لشبكة البطاقات --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 
          نكرر الهيكل العظمي لبطاقة DashboardCard 5 مرات،
          لأن هذا هو عدد البطاقات في التصميم النهائي.
        */}
        {[...Array(6)].map((_, index) => (
          <div key={index} className="border rounded-lg p-6 flex flex-col">
            {/* --- الهيكل العظمي للعنوان والأيقونة --- */}
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-7 w-32" />
            </div>

            {/* --- الهيكل العظمي للمحتوى --- */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>

            {/* --- الهيكل العظمي للزر في الأسفل --- */}
            <div className="mt-auto pt-4">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
