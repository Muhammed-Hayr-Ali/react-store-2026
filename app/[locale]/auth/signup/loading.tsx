/**
 * @file app/[locale]/(auth)/signup/loading.tsx
 * @description Loading skeleton matching the exact structure and layout of the sign-up card.
 */

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function SignUpLoading() {
  return (
    <Card>
      <CardHeader className="text-center space-y-2">
        <Skeleton className="mx-auto h-6 w-3/4 rounded-md" />
        <Skeleton className="mx-auto h-4 w-5/6 rounded-md" />
      </CardHeader>

      <CardContent>
        <div className="w-full space-y-4">
          
          {/* FirstName Field Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>

          {/* LastName Field Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>

          {/* Email Field Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>

          {/* Password Field Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>

          {/* Submit Action Skeleton */}
          <div className="pt-1">
            <Skeleton className="h-9 w-full rounded-md" />
          </div>

          {/* Divider Skeleton */}
          <div className="flex items-center justify-center py-2">
            <Skeleton className="h-3 w-10 rounded-md" />
          </div>

          {/* Google Button Skeleton */}
          <Skeleton className="h-10 w-full rounded-md" />

          {/* Sign In Link Footer Skeleton */}
          <div className="flex justify-center pt-2">
            <Skeleton className="h-4 w-44 rounded-md" />
          </div>

        </div>
      </CardContent>
    </Card>
  )
}