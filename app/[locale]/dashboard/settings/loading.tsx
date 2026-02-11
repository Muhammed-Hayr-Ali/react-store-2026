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
    <div className="space-y-12">


      <div className="space-y-8">
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
      </div>
    </div>
  );
}
