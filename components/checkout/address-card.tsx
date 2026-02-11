"use client";

import { Button } from "@/components/ui/button";
import {
  Trash2,
  Edit,
  AlertTriangle,
  Home,
  Briefcase,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge"; // ✅ 1. استيراد Badge
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // ✅ 2. استيراد Tooltip
import { UserAddress } from "@/lib/types/account/address";
import { deleteAddress } from "@/lib/actions";

interface AddressCardProps {
  address: UserAddress;
  isSelected?: boolean;
  onSelect?: (addressId: string) => void;
  showControls?: boolean;
  onEdit?: (address: UserAddress) => void;
}

export function AddressCard({
  address,
  isSelected,
  onSelect,
  showControls = false,
  onEdit,
}: AddressCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteAddress(address.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message || "Address deleted successfully.");
    }
  };

  // ✅ 3. دالة لاختيار أيقونة مناسبة
  const getAddressIcon = () => {
    const nickname = address.address_nickname?.toLowerCase();
    if (nickname === "home")
      return <Home className="h-4 w-4 text-muted-foreground" />;
    if (nickname === "work" || nickname === "office")
      return <Briefcase className="h-4 w-4 text-muted-foreground" />;
    return <MapPin className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div
      className={`border rounded-lg p-4 transition-all relative group ${
        // ✅ 4. إضافة فئة 'group'
        isSelected
          ? "border-primary ring-2 ring-primary"
          : "hover:border-primary/50"
      }`}
      onClick={() => onSelect?.(address.id)}
      style={{ cursor: onSelect ? "pointer" : "default" }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {getAddressIcon()}
          <div>
            <p className="font-bold">
              {address.first_name} {address.last_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {address.address}, {address.city}
            </p>
          </div>
        </div>
        {address.address_nickname && (
          <Badge variant="outline">{address.address_nickname}</Badge>
        )}
      </div>

      {/* ✅ 5. إظهار الأزرار عند التحويم (Hover) */}
      {showControls && (
        <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(address);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Address</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isDeleting}
                onClick={(e) => e.stopPropagation()}
              >
                {isDeleting ? (
                  <Spinner />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-destructive" />
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this address.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
