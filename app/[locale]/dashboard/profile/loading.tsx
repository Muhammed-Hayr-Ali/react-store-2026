import { Skeleton } from "@/components/ui/skeleton";
import { Building, ShieldQuestion } from "lucide-react";

// مكون فرعي لتقليد صف المعلومات (لم يتغير، لكنه جيد)
function InfoRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 h-16.5">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-8 w-24 rounded-md" />
    </div>
  );
}

// هذا هو مكون التحميل الذي سيتم عرضه تلقائيًا
export default function ProfileSettingsLoading() {
  return (
    // ✅ 1. إزالة animate-pulse من الحاوية الرئيسية لتصميم أهدأ
    <div className="space-y-12">

      <div className="border rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr]">
          <div className="flex flex-col items-center justify-center p-8 bg-muted/50 border-b md:border-b-0 md:border-r rtl:md:border-r-0 rtl:md:border-l">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>

          <div className="p-8 space-y-4 flex flex-col justify-center">
            <div className="space-y-2">
              <Skeleton className="h-7 w-4/5" /> {/* يطابق الاسم الكامل */}
              <Skeleton className="h-5 w-full" />
              {/* يطابق البريد الإلكتروني */}
            </div>
            <div className="w-16 h-1 bg-muted rounded-full" />
            {/* يطابق الخط الفاصل */}
            <Skeleton className="h-5 w-3/4" /> {/* يطابق رسالة الحالة */}
            <div className="pt-4">
              <Skeleton className="h-5 w-1/2" /> {/* يطابق تاريخ الانضمام */}
            </div>
          </div>
        </div>
      </div>
      {/* ---------------------------------------------------- */}

      <div className="space-y-8">
        {/* --- الهيكل العظمي لتفاصيل الحساب --- */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 text-primary p-2 rounded-lg">
                <Building size={20} className="text-muted-foreground" />
              </div>
              <Skeleton className="h-8 w-40" />
            </div>
          </div>
          <div className="border rounded-lg divide-y">
            <InfoRowSkeleton />
            <InfoRowSkeleton />
            <InfoRowSkeleton />
          </div>
        </div>

        {/* --- الهيكل العظمي لإعدادات الأمان --- */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <ShieldQuestion size={20} className="text-muted-foreground" />
            </div>
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="border rounded-lg divide-y">
            <InfoRowSkeleton />
            <InfoRowSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
