"use client";

import { type UserReview } from "@/lib/actions/reviews";
import Link from "next/link";
import { UserReviewCard } from "./user-review-card";

export default function MyReviewsPage({ items }: { items: UserReview[] }) {
  if (items.length === 0)
    return (
      <div className="flex flex-1 h-full items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-xl font-semibold">
            You haven&#39;t written any reviews yet.
          </h2>
          <p className="text-muted-foreground mt-2">
            Share your thoughts on products you&#39;ve purchased to help others
            make better decisions.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Reviews</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <UserReviewCard key={item.id} review={item} />
        ))}
      </div>
    </div>
  );
}
