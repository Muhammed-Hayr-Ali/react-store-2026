import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { deleteReview, Review as ReviewData } from "@/lib/actions/reviews";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DialogProps {
  className?: string;
  onClose: () => void;
  review: ReviewData | null;
  productSlug: string;
}

export default function DeleteReviewAlertDialog({
  onClose,
  review,
  productSlug,
  className,
}: DialogProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const handleDelete = async () => {
    if (!review || !review?.id) return;
    setIsLoading(true);
    const { error } = await deleteReview(review.id, productSlug);
    if (error) {
      toast.error(error);
      setIsLoading(false);
      return;
    }
    router.refresh();
    onClose();
    toast.success("Brand deleted successfully!");
    setIsLoading(false);
  };
  return (
    <AlertDialogContent size="sm" className={className}>
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
          <Trash2Icon />
        </AlertDialogMedia>
        <AlertDialogTitle>Delete Review?</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete {review?.comment}?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={handleDelete}>
          {isLoading ? <Spinner /> : "Delete"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
