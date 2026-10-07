"use client"

import * as React from "react"
import { UserIcon } from "lucide-react"
import {
  ReviewDialogName,
  ReviewSummary as ReviewSummaryType,
  ReviewWithProfile,
} from "@/lib/actions/reviews/types"

// مكونات shadcn القياسية
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

// المكونات الفرعية
import { ReviewSummary } from "./ReviewSummary"
import { ReviewItem } from "./ReviewItem"
import { ReviewDialog } from "./ReviewDialog"
import { DeleteReviewDialog } from "./DeleteReviewDialog"
import { useUser } from "@/lib/context/user-context"

interface ProductReviewsProps {
  summary: ReviewSummaryType
  reviews: ReviewWithProfile[]
  productId: string
}

export default function ProductReviews({
  summary,
  reviews,
  productId,
}: ProductReviewsProps) {

const { user } = useUser()
const currentUserId = user?.id

  // ✅ حالة موحدة لإدارة جميع الحوارات
  const [dialogState, setDialogState] = React.useState<{
    id: string | null
    openDialog: ReviewDialogName | null
  }>({
    id: null,
    openDialog: null,
  })

  const handleOnOpenChange = (open: boolean) => {
    if (!open) {
      setDialogState({ id: null, openDialog: null })
    }
  }

  return (
    <>
      <section className="mt-12 space-y-8">
        {/* رأس القسم */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Customer Reviews
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Real feedback from verified purchasers
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() =>
              setDialogState({ id: null, openDialog: "create-review" })
            }
          >
            Write a Review
          </Button>
        </div>

        <Separator />

        {/* ✅ استخدام مكون الملخص الإحصائي المنفصل */}
        <ReviewSummary summary={summary} />

        <Separator />

        {/* قائمة المراجعات */}
        <div className="space-y-2">
          {reviews.length === 0 ? (
            <div className="py-12 text-center">
              <UserIcon className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm font-medium text-foreground">
                No reviews yet
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Be the first to share your thoughts.
              </p>
            </div>
          ) : (
            reviews.map((review, idx) => {
              const isOwner = review.user_id === currentUserId

              return (
                <React.Fragment key={review.id}>
                  {idx > 0 && <Separator />}

                  {/* ✅ استخدام مكون عرض التقييم المنفصل */}
                  <ReviewItem
                    review={review}
                    isOwner={isOwner}
                    onEdit={() =>
                      setDialogState({
                        id: review.id,
                        openDialog: "edit-review",
                      })
                    }
                    onDelete={() =>
                      setDialogState({
                        id: review.id,
                        openDialog: "delete-review",
                      })
                    }
                  />
                </React.Fragment>
              )
            })
          )}
        </div>
      </section>

      {/* ✅ إدارة الحوارات في مكان واحد */}
      <ReviewDialog
        productId={productId}
        openDialog={dialogState.openDialog}
        onOpenChange={handleOnOpenChange}
        review={reviews.find((r) => r.id === dialogState.id)}
      />

      <DeleteReviewDialog
        id={dialogState.id}
        openDialog={dialogState.openDialog}
        onOpenChange={handleOnOpenChange}
      />
    </>
  )
}
