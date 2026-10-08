"use client"

import { useFormatter } from "next-intl"
import {
  StarIcon,
  PencilIcon,
  Trash2Icon,
  FlagIcon,
} from "lucide-react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ReviewWithProfile } from "@/lib/actions/reviews/types"
import { ReportDialog } from "@/components/shared/report-dialog"

interface ReviewItemProps {
  review: ReviewWithProfile
  isOwner: boolean
  onEdit: () => void
  onDelete: () => void
}

export function ReviewItem({
  review,
  isOwner,
  onEdit,
  onDelete,
}: ReviewItemProps) {
  const format = useFormatter()

  const fullName =
    [review.profile?.first_name, review.profile?.last_name]
      .filter(Boolean)
      .join(" ") || "Verified Customer"

  const formattedDate = format.dateTime(new Date(review.created_at), {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <article className="group flex flex-col gap-4 py-2 sm:flex-row sm:items-start sm:gap-6">
      {/* الجزء الأيسر: الصورة، الاسم، التاريخ، والنجوم */}
      <div className="flex shrink-0 flex-col items-start justify-start gap-2 sm:w-52">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={review.profile?.profile_image || undefined} />
          </Avatar>
          <span className="text-sm font-medium text-foreground">
            {fullName}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div dir="ltr" className="flex items-center gap-0.5 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`size-3.5 ${
                  i < review.rating
                    ? "fill-current"
                    : "text-muted-foreground/20"
                }`}
              />
            ))}
          </div>
          <time
            dateTime={review.created_at}
            suppressHydrationWarning
            className="text-xs text-muted-foreground tabular-nums"
          >
            {formattedDate}
          </time>
        </div>
      </div>

      {/* الجزء الأيمن: التعليق وأزرار الإجراءات */}
      <div className="flex flex-1 flex-col justify-between gap-3">
        {review.comment?.trim() ? (
          <p className="text-sm leading-relaxed wrap-break-word text-foreground">
            {review.comment}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            (No review text provided)
          </p>
        )}

        {/* أزرار الإجراءات (تعديل/حذف للمالك، أو إبلاغ للآخرين) */}
        <div className="mt-1 flex items-center justify-end">
          {isOwner ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={onEdit}
                aria-label="Edit review"
              >
                <PencilIcon className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={onDelete}
                aria-label="Delete review"
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
          ) : (
            <ReportDialog
              targetType="review"
              targetId={review.id}
              title="Report Review"
              description="Help us maintain a constructive community. Why are you reporting this review?"
            >
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-hidden"
                aria-label="Report review"
              >
                <FlagIcon className="size-3.5" />
                <span>Report</span>
              </button>
            </ReportDialog>
          )}
        </div>
      </div>
    </article>
  )
}
