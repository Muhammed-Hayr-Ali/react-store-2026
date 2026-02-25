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
import { Category, deleteCategory } from "@/lib/actions/category";
import { Trash2Icon } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DialogProps {
  className?: string;
  onClose: () => void;
  category: Category | null;
}

const isRtlLocale = (locale: string) => {
  return ["ar", "fa", "he", "ur"].includes(locale);
};

export default function DeleteCategoryAlertDialog({
  onClose,
  category,
  className,
}: DialogProps) {
  const router = useRouter();
  const locale = useLocale();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  const [isLoading, setIsLoading] = useState(false);
  const handleDelete = async () => {
    if (!category || !category?.id) return;
    setIsLoading(true);
    const { error } = await deleteCategory(category?.id);
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
    <AlertDialogContent size="sm" className={className} dir={dir}>
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
          <Trash2Icon />
        </AlertDialogMedia>
        <AlertDialogTitle>Delete Brand?</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete {category?.name}?
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
