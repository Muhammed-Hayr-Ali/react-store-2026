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
import { deleteProductOptionValue } from "@/lib/actions/product-option-values";
import { Trash2Icon } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DialogProps {
  className?: string;
  onClose: () => void;
  valueId: string | null;
}


export default function DeleteVariantDialogAlertDialog({
  onClose,
  valueId,
  className,
}: DialogProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const handleDelete = async () => {
    if (!valueId) return;
    setIsLoading(true);
    const { error } = await deleteProductOptionValue(valueId);
    if (error) {
      toast.error(error);
      setIsLoading(false);
      return;
    }
    router.refresh();
    onClose();
    toast.success("Value deleted successfully!");
    setIsLoading(false);
  };
  return (
    <AlertDialogContent size="sm" className={className}>
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
          <Trash2Icon />
        </AlertDialogMedia>
        <AlertDialogTitle>Delete Value?</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete this value
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
