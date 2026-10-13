import { PERMISSION_GROUPS } from "@/lib/actions/role/permission-groups"
import { Skeleton } from "@/components/ui/skeleton"

export function RoleFormSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:items-start">
        <div className="order-2 min-w-0 lg:order-1 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-sm" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36 rounded-md" />
                  <Skeleton className="h-3 w-56 rounded-md" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            </div>

            <div className="space-y-4">
              {PERMISSION_GROUPS.map((group) => (
                <div
                  key={group.id}
                  className="space-y-3 rounded-lg border border-border bg-muted/10 p-4"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-7 w-24 rounded-md" />
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {group.permissions.map((permission) => (
                      <div
                        key={permission.key}
                        className="flex items-start gap-2.5 rounded-lg border border-border/60 p-2.5"
                      >
                        <Skeleton className="mt-0.5 size-4 shrink-0 rounded-sm" />
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-28 max-w-full rounded-md" />
                          <Skeleton className="h-2.5 w-40 max-w-full rounded-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="contents lg:order-2 lg:col-span-1 lg:flex lg:min-w-0 lg:flex-col lg:space-y-6">
          <div className="order-1 rounded-xl border border-border bg-card p-5 shadow-xs lg:order-0">
            <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
              <Skeleton className="size-4 rounded-sm" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-28 rounded-md" />
                  <Skeleton className="h-3 w-12 rounded-md" />
                </div>
                <Skeleton className="h-24 w-full rounded-md" />
              </div>
            </div>
          </div>

          <div className="order-3 rounded-xl border border-border bg-card p-5 shadow-xs lg:order-0">
            <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-sm" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36 rounded-md" />
                  <Skeleton className="h-3 w-44 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-4 w-12 rounded-md" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>

          <div className="order-4 rounded-xl border border-border bg-card p-5 shadow-xs lg:order-0">
            <div className="mb-4 border-b border-border/60 pb-3">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="mt-1 h-3 w-40 rounded-md" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
