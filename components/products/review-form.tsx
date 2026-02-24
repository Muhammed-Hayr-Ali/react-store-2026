'use client";'

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";


interface WriteReviewProps {
  productId: string;
  productName: string;
  productSlug: string;
}

export default function WriteReview({
  productId,
  productName,
  productSlug,
}: WriteReviewProps) {
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  return (
    <Dialog open={isReviewFormOpen} onOpenChange={setIsReviewFormOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Write a Review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>Write a review for</DialogTitle>
          <p className="text-sm text-muted-foreground pt-1">{productName}</p>
        </DialogHeader>
        <AddReviewForm
          productId={productId}
          productSlug={productSlug}
          onFormSubmit={() => setIsReviewFormOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
