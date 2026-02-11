"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Sun,
  Moon,
  Laptop,
  Palette,
  AlertTriangle,
  Globe,
  LockKeyhole,
  ChevronRight,
  Key,
  Trash2,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import ManageMfa from "./manage-mfa/manage-mfa";
import { UpdatePasswordForm } from "./update-password-form";
import { CardGroup } from "../ui/card-group";
import { CardRow } from "../ui/card-row";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestDeleteAccountDialog } from "./RequestDeleteAccountDialog";
import { getMfaFactors } from "@/lib/actions/mfa";
import { Spinner } from "@/components/ui/spinner";

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const themes = [
    { name: "Light", value: "light", icon: Sun },
    { name: "Dark", value: "dark", icon: Moon },
    { name: "System", value: "system", icon: Laptop },
  ];

  useEffect(() => {
    const initializeMounted = async () => {
      await new Promise((resolve) => setTimeout(resolve, 0)); // Introduce a small delay
      setMounted(true);
    };
    initializeMounted();
  }, []);

  function handleThemeChange(value: string) {
    setTheme(value);
  }

  return (
    <Tabs defaultValue={theme} onValueChange={handleThemeChange}>
      <TabsList>
        {mounted ? (
          themes.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              <t.icon className="h-4 w-4" />
              <p className="hidden md:inline">{t.name}</p>
            </TabsTrigger>
          ))
        ) : (
          <>
            <TabsTrigger value="light">
              <Sun className="h-4 w-4" />
              <p className="hidden md:inline">Light</p>
            </TabsTrigger>
            <TabsTrigger value="dark">
              <Moon className="h-4 w-4" />
              <p className="hidden md:inline">Dark</p>
            </TabsTrigger>
            <TabsTrigger value="system">
              <Laptop className="h-4 w-4" />
              <p className="hidden md:inline">System</p>
            </TabsTrigger>
          </>
        )}
      </TabsList>
    </Tabs>
  );
}

//================================================================================
// 2. المكون الفرعي لتغيير اللغة (Language Switcher)
//================================================================================
function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChangeLocale = (selectedLocale: string) => {
    if (selectedLocale && selectedLocale !== locale) {
      const newPath = pathname.replace(`/${locale}`, "");
      const params = new URLSearchParams(searchParams.toString());
      router.push(`/${selectedLocale}${newPath}?${params.toString()}`);
    }
  };

  const languages = [
    { name: "English", value: "en" },
    { name: "العربية", value: "ar" },
  ];

  return (
    <Tabs defaultValue={locale} onValueChange={handleChangeLocale}>
      <TabsList>
        {languages.map((l) => (
          <TabsTrigger key={l.value} value={l.value}>
            {l.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

//================================================================================
// 3. المكون الرئيسي لصفحة الإعدادات (Settings Page)
//================================================================================
type DialogState =
  | "changePassword"
  | "enableMfa"
  | "disableMfa"
  | "confirmSignOut"
  | null;

export default function SettingsPage({ email }: { email: string | null }) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [activeDialog, setActiveDialog] = useState<DialogState>(null);
  const [showMfaAlert, setShowMfaAlert] = useState(false);

  const getFactorStatus = async () => {
    setIsLoading(true);
    const { data: factor, error } = await getMfaFactors();

    if (error || !factor) {
      setIsLoading(false);
      return false;
    }
    setIsLoading(false);
    return true;
  };

  const handleChangePasswordClick = async () => {
    const verifiedFactor = await getFactorStatus();
    if (verifiedFactor) {
      setShowMfaAlert(true);
    } else {
      setActiveDialog("changePassword");
    }
  };

  const handleSignOut = async () => {
    const error = await signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("You have been signed out.");
      router.push("/");
    }
    setActiveDialog(null);
  };

  return (
    <>
      <div className="space-y-8">
        {/* --- general --- */}
        <CardGroup
          title="General"
          description="Customize the look and feel of the application."
        >
          <CardRow
            icon={<Palette className="h-5 w-5 text-white" />}
            iconBackground="bg-blue-500"
            label="Appearance"
          >
            <ThemeSwitcher />
          </CardRow>
          <CardRow
            icon={<Globe className="h-5 w-5 text-white" />}
            iconBackground="bg-green-500"
            label="Language"
          >
            <LanguageSwitcher />
          </CardRow>
        </CardGroup>

        {/* --- security --- */}
        <CardGroup title="Security" description="Password and MFA settings.">
          <CardRow
            icon={<LockKeyhole className="h-5 w-5 text-white" />}
            iconBackground="bg-orange-500"
            label="Password"
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={handleChangePasswordClick}
            >
              <p className="hidden md:inline">Change Password</p>
              {isLoading ? (
                <Spinner />
              ) : (
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              )}
            </Button>
          </CardRow>

          <CardRow
            icon={<Key className="h-5 w-5 text-white" />}
            iconBackground="bg-gray-500"
            label="Two-Factor Auth"
          >
            <ManageMfa />
          </CardRow>
        </CardGroup>

        {/* --- account actions --- */}
        <CardGroup
          title="Account Actions"
          description="Manage your session and account data."
        >
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-center text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setActiveDialog("confirmSignOut")}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
          <div className="p-2">
            <RequestDeleteAccountDialog email={email}>
              <Button
                variant="ghost"
                className="w-full justify-center text-red-700 hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </RequestDeleteAccountDialog>
          </div>
        </CardGroup>
      </div>

      {/* --- النوافذ المنبثقة (changePassword) --- */}
      <Dialog
        open={activeDialog === "changePassword"}
        onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <UpdatePasswordForm onFormSubmit={() => setActiveDialog(null)} />
        </DialogContent>
      </Dialog>

      {/* --- النوافذ المنبثقة (showMfaAlert) --- */}
      <AlertDialog open={showMfaAlert} onOpenChange={setShowMfaAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-amber-500" />
              Action Required
            </AlertDialogTitle>
            <AlertDialogDescription>
              For your security, you must disable Two-Factor Authentication
              (2FA) before you can change your password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Got it</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- النوافذ المنبثقة (confirmSignOut) --- */}
      <AlertDialog
        open={activeDialog === "confirmSignOut"}
        onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to sign out?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You will be returned to the homepage and will need to sign in
              again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
