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
import { Badge } from "@/components/ui/badge";
import { deleteAddress, UserAddress } from "@/lib/actions/address";

interface AddressCardProps {
  address: UserAddress;
  onEdit: (address: UserAddress) => void;
}

export function AddressCard({ address, onEdit }: AddressCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteAddress(address.id);
    if (result.error) {
      toast.error(result.error);
      setIsDeleting(false); // أعد الزر إلى حالته الطبيعية في حالة الفشل
    } else {
      toast.success("Address deleted successfully.");
      // لا حاجة لـ setIsDeleting(false) هنا، لأن المكون سيختفي
    }
  };

  const getAddressIcon = () => {
    const nickname = address.address_nickname?.toLowerCase();
    if (nickname === "home") return <Home className="h-5 w-5 text-primary" />;
    if (nickname === "work" || nickname === "office")
      return <Briefcase className="h-5 w-5 text-primary" />;
    return <MapPin className="h-5 w-5 text-primary" />;
  };

  return (
    <div className="border rounded-xl flex flex-col">
      {/* 1. رأس البطاقة */}
      <div className="p-4 border-b bg-muted/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {getAddressIcon()}
          <h3 className="text-lg font-semibold">
            {address.address_nickname ||
              `${address.first_name} ${address.last_name}`}
          </h3>
        </div>
        {address.address_nickname && <Badge>{address.address_nickname}</Badge>}
      </div>

      {/* 2. جسم البطاقة */}
      <div className="p-6 space-y-2 text-sm text-muted-foreground grow">
        <p className="font-medium text-foreground">
          {address.first_name} {address.last_name}
        </p>
        <p>{address.address}</p>
        <p>
          {address.city}, {address.state} {address.zip}
        </p>
        <p>{address.country}</p>
      </div>

      {/* 3. ذيل البطاقة (الأزرار) */}
      <div className="p-4 border-t bg-muted/50 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(address)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isDeleting}>
              {isDeleting ? (
                <Spinner className="mr-2" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive" />
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                address.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, delete address
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
