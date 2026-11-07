/**
 * @file app/[locale]/(auth)/forgot-password/loading.tsx
 * @description Loading skeleton matching the exact structure and layout of the card.
 */

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ForgotPasswordLoading() {
  return (
    <Card>
      <CardHeader className="text-center space-y-2">
        <Skeleton className="mx-auto h-6 w-3/4 rounded-md" />
        <Skeleton className="mx-auto h-4 w-5/6 rounded-md" />
      </CardHeader>

      <CardContent>
        <div className="w-full space-y-4">
          
          {/* Email Field Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>

          {/* Submit Action Skeleton */}
          <div className="pt-1">
            <Skeleton className="h-9 w-full rounded-md" />
          </div>

          {/* Footer Link Skeleton */}
          <div className="flex justify-center pt-2">
            <Skeleton className="h-4 w-44 rounded-md" />
          </div>

        </div>
      </CardContent>
    </Card>
  )
}