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
import { Brand, deleteBrand } from "@/lib/actions/brands";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DialogProps {
  className?: string;
  onClose: () => void;
  brand: Brand | null;
}

export default function DeleteBrandAlertDialog({
  onClose,
  brand,
  className,
}: DialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const handleDelete = async () => {
    if (!brand || !brand?.id) return;
    setIsLoading(true);
    const { error } = await deleteBrand(brand?.id);
    if (error) {
      toast.error(error);
      setIsLoading(false);
      return;
    }
    router.refresh();
    onClose();
    toast.success("Brand deleted successfully!");
  };
  return (
    <AlertDialogContent size="sm" className={className}>
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
          <Trash2Icon />
        </AlertDialogMedia>
        <AlertDialogTitle>Delete Brand?</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete {brand?.name}?
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
