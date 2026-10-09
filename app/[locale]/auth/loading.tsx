/**
 * @file app/[locale]/(auth)/loading.tsx
 * @description 1:1 geometric matching skeleton loader to eliminate Cumulative Layout Shift (CLS).
 */

import { Skeleton } from "@/components/ui/skeleton"

export default function AuthLoading() {
  return (
    <div className="flex w-full flex-col space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col space-y-2 pb-6 text-start">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-36 sm:h-9 sm:w-44" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Inputs Skeleton */}
      <div className="space-y-4">
        {/* Field 1 */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* Field 2 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* Submit Button Skeleton */}
        <div className="pt-2">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* Separator Skeleton */}
        <div className="flex items-center gap-2 py-1">
          <Skeleton className="h-px flex-1" />
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-px flex-1" />
        </div>

        {/* OAuth Button Skeleton */}
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  )
}