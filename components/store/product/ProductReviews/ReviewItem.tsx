"use client"

import { StarIcon, User2Icon, PencilIcon, Trash2Icon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CustomButton } from "@/components/ui/custom-button"
import { ReviewWithProfile } from "@/lib/actions/reviews/types"

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
  const fullName =
    [review.profile?.first_name, review.profile?.last_name]
      .filter(Boolean)
      .join(" ") || "Verified Customer"

  return (
    <article className="flex flex-col gap-4 py-2 sm:flex-row sm:items-start sm:gap-6">
      {/* الجزء الأيسر: الصورة، الاسم، التاريخ، والنجوم */}
      <div className="flex shrink-0 flex-col items-start justify-start gap-2 sm:w-52">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={review.profile?.profile_image || undefined} />
            <AvatarFallback className="p-2">
              <User2Icon className="size-4" />
            </AvatarFallback>
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
          <time className="text-xs text-muted-foreground tabular-nums">
            {new Date(review.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        </div>
      </div>

      {/* الجزء الأيمن: التعليق وأزرار التحكم */}
      <div className="flex flex-1 flex-col gap-2">
        {review.comment?.trim() ? (
          <p className="text-sm leading-relaxed wrap-break-word text-foreground">
            {review.comment}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            (No review text provided)
          </p>
        )}

        {/* أزرار التحكم (فقط للمالك) */}
        {isOwner && (
          <div className="mt-1 flex items-center justify-end gap-2">
            <CustomButton
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={onEdit}
              aria-label="Edit review"
            >
              <PencilIcon className="size-4" />
            </CustomButton>
            <CustomButton
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={onDelete}
              aria-label="Delete review"
            >
              <Trash2Icon className="size-4" />
            </CustomButton>
          </div>
        )}
      </div>
    </article>
  )
}
