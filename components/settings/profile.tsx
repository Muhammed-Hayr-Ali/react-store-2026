// components/settings/profile.tsx

"use client";

import React, { useState } from "react";
import { useUserDisplay } from "@/hooks/useUserDisplay";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Mail, Phone, LogOut, Edit, User2, UserIcon } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { useAuth } from "@/lib/provider/auth-provider";
import { ProfileForm } from "./ProfileForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/lib/actions/auth";
import { toast } from "sonner";
import { ro } from "date-fns/locale";
import { useRouter } from "next/navigation";

// ... (مكون ProfileView يبقى كما هو، فهو ممتاز)
interface ProfileViewProps {
  user: User | undefined;
  onEdit: () => void;
  onSignOut: () => void;
}

function ProfileView({ user, onEdit, onSignOut }: ProfileViewProps) {
  const { fullName, avatarUrl, email } = useUserDisplay(user);
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src={avatarUrl} alt={fullName} />
          <AvatarFallback>
            <UserIcon />
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-2xl">{fullName}</CardTitle>
        <CardDescription>{email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center text-sm">
          <User2 className="w-4 h-4 mr-3 text-muted-foreground" />
          <span>{fullName}</span>
        </div>
        <div className="flex items-center text-sm">
          <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
          <span>{email}</span>
        </div>
        {/* ✅ نقرأ الهاتف من user.phone أو من user_metadata كبديل */}
        {(user?.phone || user?.user_metadata?.phone) && (
          <div className="flex items-center text-sm">
            <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
            <span>{user.phone || user.user_metadata.phone}</span>
          </div>
        )}
        <hr />
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onEdit} className="flex-1">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button onClick={onSignOut} variant="outline" className="flex-1">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ====================================================================
// المكون الرئيسي للصفحة
// ====================================================================
export default function Profile({ user }: { user: User | undefined }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const handleSignOut = async () => {
    const error = await signOut();
    if (error) {
      toast.error(error.error);
    }
    router.refresh();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  // وضع التعديل
  if (isEditing) {
    // ✅ *** التعديل الرئيسي هنا ***
    // نقوم بتهيئة بيانات النموذج من الأماكن الصحيحة في كائن المستخدم
    const profileData = {
      full_name: user.user_metadata?.name || "", // <-- نقرأ من 'name'
      avatar_url: user.user_metadata?.avatar || null, // <-- نقرأ من 'avatar'
      phone: user.phone || user.user_metadata?.phone || null, // <-- نقرأ من كلا المكانين
    };

    return (
      <div className="container mx-auto my-12 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Edit Your Profile</CardTitle>
            <CardDescription>
              Update your personal information and avatar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* ✅ نمرر البيانات المهيأة إلى النموذج */}
            <ProfileForm user={user} profile={profileData} />
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="mt-4 w-full"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // وضع العرض
  return (
    <div className="container mx-auto">
      <ProfileView
        user={user}
        onEdit={() => setIsEditing(true)}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
