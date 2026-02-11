// app/(main)/settings/ProfileForm.tsx

"use client";

import React, { useActionState, useEffect, useState } from "react";
// ✅ 1. استخدام useActionState من React لإدارة حالة الإجراء
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

import { updateProfile, type ProfileUpdateResult } from "@/lib/user/actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFormStatus } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon } from "lucide-react";

// مكون زر الإرسال لإظهار حالة التحميل
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Spinner /> : "Save Changes"}
    </Button>
  );
}

interface ProfileFormProps {
  user: User;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  };
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url,
  );

  // ✅ 2. ربط النموذج بدالة الخادم باستخدام useActionState
  // القيمة null هي الحالة الأولية
  const [state, formAction] = useActionState<
    ProfileUpdateResult | null,
    FormData
  >(updateProfile, null);

  // عرض رسائل التوست والأخطاء عند تغير الحالة
  useEffect(() => {
    if (state?.error) {
      // إذا كانت هناك أخطاء في الحقول، يمكنك عرضها أيضًا
      if (state.error.fields) {
        // مثال: يمكنك استخدام هذه البيانات لعرض خطأ تحت الحقل المناسب
        console.error("Field errors:", state.error.fields);
      }
      toast.error(state.error.message);
    }
    if (state?.data) {
      toast.success(state.data.message);
    }
  }, [state]);

  // تحديث معاينة الصورة عند اختيار ملف جديد
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    // ✅ 3. ربط دالة الإجراء مباشرة بخاصية 'action' في النموذج
    <form action={formAction} className="space-y-8">
      {/* قسم الصورة الرمزية */}
      <div className="flex items-center gap-4">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src={avatarPreview ?? ""} alt={profile.full_name ?? ""} />
          <AvatarFallback>
            <UserIcon />
          </AvatarFallback>
        </Avatar>

        <div className="grid gap-1.5 w-full">
          <Label htmlFor="avatar">Avatar</Label>
          <Input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
          />
          <p className="text-sm text-muted-foreground">Upload a new picture.</p>
        </div>
      </div>

      {/* حقل الاسم الكامل */}
      <div className="grid gap-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={profile.full_name ?? ""}
        />
        {/* يمكنك عرض أخطاء الخادم هنا إذا أردت */}
        {state?.error?.fields?.fullName && (
          <p className="text-sm text-destructive">
            {state.error.fields.fullName[0]}
          </p>
        )}
      </div>

      {/* حقل البريد الإلكتروني (للقراءة فقط) */}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={user.email ?? ""} disabled />
      </div>

      {/* حقل الهاتف */}
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
        />
        {/* يمكنك عرض أخطاء الخادم هنا إذا أردت */}
        {state?.error?.fields?.phone && (
          <p className="text-sm text-destructive">
            {state.error.fields.phone[0]}
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
