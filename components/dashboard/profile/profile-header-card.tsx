"use client";

import { type User } from "@supabase/supabase-js";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// --- استيرادات الواجهة ---
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- استيرادات الأيقونات والمساعدات ---
import {
  Edit,
  CalendarDays,
  ImagePlus,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { format } from "date-fns";
import { parseUserNames } from "@/lib/utils/parse-user-names";

// --- استيرادات Server Actions ---
import { uploadProfilePicture, deleteProfilePicture } from "@/lib/actions/user";

interface ProfileHeaderCardProps {
  user: User;
  onEdit: () => void;
}

export function ProfileHeaderCard({ user, onEdit }: ProfileHeaderCardProps) {
  const router = useRouter();
  const meta = user.user_metadata;
  const { firstName, lastName } = parseUserNames(user);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentAvatarUrl = meta.avatar_url || meta.avatar;
  const isSupabaseAvatar = currentAvatarUrl
    ? currentAvatarUrl.includes(process.env.NEXT_PUBLIC_SUPABASE_URL!)
    : false;

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);
    const { error } = await uploadProfilePicture(formData);

    if (error) {
      toast.error(error);
      setIsUploading(false);
      return;
    }

    router.refresh();
    setIsUploading(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await deleteProfilePicture();

    if (error) {
      toast.error(error);
      setIsDeleting(false);
      return;
    }

    router.refresh();
    setIsDeleting(false);
  };

  return (
    <div className="relative border rounded-xl overflow-hidden bg-muted/30">
      {/* ✅ --- زر التعديل العام في الزاوية --- */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 rtl:right-auto rtl:left-4 h-8 w-8 z-10"
        onClick={onEdit}
        title="Edit profile details"
      >
        <Edit className="h-4 w-4" />
      </Button>
      {/* ------------------------------------ */}

      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* --- القسم الأيسر: الصورة الرمزية وإدارتها --- */}
        <div className="col-span-1 flex flex-col items-center justify-center p-8 bg-muted/50 border-b md:border-b-0 md:border-r rtl:md:border-r-0  rtl:md:border-l">
          {/* ✅ --- القائمة المنسدلة مسؤولة فقط عن الصورة --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-muted/50">
                <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                  <AvatarImage src={currentAvatarUrl} alt={fullName} />
                  <AvatarFallback className="text-5xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {isUploading ? (
                    <Spinner />
                  ) : (
                    <MoreVertical className="h-8 w-8 text-white" />
                  )}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={handleUploadClick}
                disabled={isUploading}
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                <span>Upload Picture</span>
              </DropdownMenuItem>

              {isSupabaseAvatar && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      disabled={isDeleting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete Picture</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your profile picture.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isDeleting ? <Spinner /> : "Yes, delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* ------------------------------------------------ */}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/gif"
            disabled={isUploading}
          />
        </div>

        {/* --- القسم الأيمن: المعلومات --- */}
        <div className="col-span-2 p-8 space-y-4 flex flex-col justify-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{fullName}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <div className="w-16 h-1 bg-primary rounded-full" />
          <p className="text-lg italic text-foreground/80">
            {meta.status_message ? (
              `“${meta.status_message}”`
            ) : (
              <span className="text-muted-foreground">
                No status message set.
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4">
            <CalendarDays className="h-4 w-4" />
            <span>
              Joined on {format(new Date(user.created_at), "MMMM d, yyyy")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
