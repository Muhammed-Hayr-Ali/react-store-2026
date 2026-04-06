"use client";

import { useState, useTransition, useMemo, useRef } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { updateProfile, uploadAvatar } from "@/lib/actions/profile";
import { CsrfTokenInput } from "@/components/shared/csrf-token-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Mail,
  Phone,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  Camera,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

const TIMEZONES = [
  { value: "Asia/Damascus", label: "Asia/Damascus (GMT+3)" },
  { value: "Asia/Riyadh", label: "Asia/Riyadh (GMT+3)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GMT+4)" },
  { value: "Asia/Kuwait", label: "Asia/Kuwait (GMT+3)" },
  { value: "Africa/Cairo", label: "Africa/Cairo (GMT+2)" },
  { value: "Europe/London", label: "Europe/London (GMT+0)" },
  { value: "America/New_York", label: "America/New_York (GMT-5)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (GMT-8)" },
];

export default function AccountSettingsPage() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const pathname = usePathname();
  const { profile, refresh } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute initial avatar URL from profile (no effect needed)
  const initialAvatarUrl = useMemo(() => {
    const profileAvatar = profile?.profile?.avatar_url;
    const user = profile?.user as User | null | undefined;
    const authAvatar = user?.user_metadata?.avatar_url;
    return profileAvatar || authAvatar || "";
  }, [profile]);

  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  // Handle avatar file upload
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("avatarTooLarge"));
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("avatarInvalidType"));
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("avatar", file);

    // Add CSRF token
    const csrfInput = document.querySelector(
      'input[name="csrfToken"]',
    ) as HTMLInputElement;
    if (csrfInput) {
      formData.append("csrfToken", csrfInput.value);
    }

    const result = await uploadAvatar(undefined, formData);

    if (!result.success) {
      toast.error(result.error || t("uploadFailed"));
      setIsUploading(false);
      return;
    }

    setAvatarUrl(result.data.avatar_url);
    refresh();
    toast.success(t("avatarUploaded"));
    setIsUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove avatar
  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar_url", "");

      const csrfInput = document.querySelector(
        'input[name="csrfToken"]',
      ) as HTMLInputElement;
      if (csrfInput) {
        formData.append("csrfToken", csrfInput.value);
      }

      const result = await updateProfile(undefined, formData);

      if (result.success) {
        setAvatarUrl("");
        refresh();
        toast.success(t("avatarRemoved"));
      } else {
        toast.error(result.error || t("updateError"));
      }
    } catch {
      toast.error(t("updateError"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setShowSuccess(false);

    startTransition(async () => {
      const result = await updateProfile(undefined, formData);

      if (!result.success) {
        setError(result.error || t("updateError"));
        toast.error(result.error || t("updateError"));
        return;
      }

      setShowSuccess(true);
      refresh();

      // Redirect to new locale if language changed using next-intl router
      if (
        result.data?.preferred_language &&
        result.data.preferred_language !== locale
      ) {
        toast.success(t("updateSuccessAndRedirect"));

        // Use next-intl's router to switch locale
        // next-intl's router.push automatically handles locale switching
        router.push(pathname, { locale: result.data.preferred_language });
      } else {
        toast.success(t("updateSuccess"));
      }
    });
  };

  const getInitials = () => {
    if (!profile?.profile) return "U";
    const first = profile.profile.first_name || "";
    const last = profile.profile.last_name || "";
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "U";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <Separator />

      {/* Success/Error Messages */}
      {showSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4" />
          <span>{t("updateSuccess")}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-4 w-4" />
          <span>
            {t("updateError")}: {error}
          </span>
        </div>
      )}

      {/* Profile Information */}
      <form action={handleSubmit} className="space-y-6">
        <CsrfTokenInput />

        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {t("avatar")}
            </CardTitle>
            <CardDescription>{t("avatarDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={
                      avatarUrl ||
                      profile?.profile?.avatar_url ||
                      profile?.user?.user_metadata?.avatar_url ||
                      undefined
                    }
                    alt={profile?.profile?.full_name || "User"}
                  />
                  <AvatarFallback className="text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {/* Upload overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("avatarHint")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("avatarFormats")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {isUploading ? t("uploading") : t("uploadImage")}
                  </Button>
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isUploading}
                      onClick={handleRemoveAvatar}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("removeAvatar")}
                    </Button>
                  )}
                </div>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("personalInfo")}</CardTitle>
            <CardDescription>{t("personalInfoDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={profile?.profile?.email || ""}
                disabled
                className="max-w-md bg-muted"
              />
              <p className="text-xs text-muted-foreground">{t("emailHint")}</p>
            </div>

            <Separator />

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="first_name">{t("firstName")}</Label>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                defaultValue={profile?.profile?.first_name || ""}
                placeholder={t("firstNamePlaceholder")}
                className="max-w-md"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="last_name">{t("lastName")}</Label>
              <Input
                id="last_name"
                name="last_name"
                type="text"
                defaultValue={profile?.profile?.last_name || ""}
                placeholder={t("lastNamePlaceholder")}
                className="max-w-md"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {t("phone")}
              </Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                defaultValue={profile?.profile?.phone_number || ""}
                placeholder={t("phonePlaceholder")}
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>{t("preferences")}</CardTitle>
            <CardDescription>{t("preferencesDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Language */}
            <div className="space-y-2">
              <Label
                htmlFor="preferred_language"
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                {t("language")}
              </Label>
              <Select
                name="preferred_language"
                key={profile?.profile?.preferred_language || "loading"}
                defaultValue={profile?.profile?.preferred_language || "en"}
              >
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder={t("selectLanguage")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("languageHint")}
              </p>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t("timezone")}
              </Label>
              <Select
                name="timezone"
                key={profile?.profile?.timezone || "loading"}
                defaultValue={profile?.profile?.timezone || "Asia/Riyadh"}
              >
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder={t("selectTimezone")} />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} className="min-w-37.5">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("saving")}
              </>
            ) : (
              t("saveChanges")
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
