"use client";

import { useAuth } from "@/lib/providers/auth-provider";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  RefreshCw,
  LogOut,
  LogIn,
  User,
  Key,
  Lock,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Activity,
  Mail,
  Phone,
  Image as ImageIcon,
  Calendar,
} from "lucide-react";
import { appRouter } from "@/lib/navigation";
import { toast } from "sonner";

/**
 * 🔐 Auth Debug Component - Enhanced UI
 * يعرض بيانات المستخدم الكاملة من AuthProvider
 */
export function AuthDebug() {
  const {
    user,
    profile,
    isLoading,
    isAuthenticated,
    hasRole,
    hasPermission,
    refresh,
    signOut,
  } = useAuth();

  const [showJson, setShowJson] = useState(false);
  const [showRoles, setShowRoles] = useState(true);
  const [showPerms, setShowPerms] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (process.env.NODE_ENV !== "development") return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
      toast.success("Auth refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh auth");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignIn = () => {
    window.location.href = appRouter.signIn;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleRoles = () => setShowRoles((prev) => !prev);
  const togglePerms = () => setShowPerms((prev) => !prev);
  const toggleJson = () => setShowJson((prev) => !prev);

  return (
    <div className="fixed right-4 bottom-4 z-50 max-h-[80vh] w-[420px] overflow-hidden rounded-xl border bg-card shadow-2xl">
      {/* ===== Header ===== */}
      <div className="border-b bg-gradient-to-r from-primary/5 to-primary/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Auth Debug</h3>
              <p className="text-[10px] text-muted-foreground">
                Development Mode
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw
                className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            {isAuthenticated ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleSignOut}
                className="h-8 gap-1.5 text-xs"
              >
                <LogOut className="h-3 w-3" />
                Sign Out
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSignIn}
                className="h-8 gap-1.5 text-xs"
              >
                <LogIn className="h-3 w-3" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ===== Scrollable Content ===== */}
      <div className="max-h-[calc(80vh-80px)] overflow-y-auto p-4">
        {/* ===== Status Banner ===== */}
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isAuthenticated
                      ? "bg-green-500/20 text-green-600"
                      : "bg-red-500/20 text-red-600"
                  }`}
                >
                  {isLoading ? (
                    <Activity className="h-5 w-5 animate-pulse" />
                  ) : isAuthenticated ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <LogIn className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                    </span>
                    <Badge
                      variant={isAuthenticated ? "default" : "destructive"}
                      className="text-[10px]"
                    >
                      {isAuthenticated ? "Active" : "Guest"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || "No email available"}
                  </p>
                </div>
              </div>
              {isLoading && (
                <Badge variant="outline" className="text-[10px]">
                  Loading...
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {profile && (
          <div className="space-y-4">
            {/* ===== Profile Info ===== */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoField
                  icon={<User className="h-3 w-3" />}
                  label="User ID"
                  value={profile.profile.id?.slice(0, 8) + "..."}
                  onCopy={() =>
                    profile.profile.id &&
                    copyToClipboard(profile.profile.id, "id")
                  }
                  copied={copiedField === "id"}
                />
                <InfoField
                  icon={<Mail className="h-3 w-3" />}
                  label="Email"
                  value={profile.profile.email}
                  copied={copiedField === "email"}
                  onCopy={() =>
                    profile.profile.email &&
                    copyToClipboard(profile.profile.email, "email")
                  }
                />
                <InfoField
                  icon={<User className="h-3 w-3" />}
                  label="Full Name"
                  value={profile.profile.full_name}
                />
                <div className="grid grid-cols-2 gap-2">
                  <InfoField
                    icon={<User className="h-3 w-3" />}
                    label="First Name"
                    value={profile.profile.first_name}
                    compact
                  />
                  <InfoField
                    icon={<User className="h-3 w-3" />}
                    label="Last Name"
                    value={profile.profile.last_name}
                    compact
                  />
                </div>
                <InfoField
                  icon={<Phone className="h-3 w-3" />}
                  label="Phone"
                  value={profile.profile.phone_number}
                  badge={
                    profile.profile.is_phone_verified ? (
                      <Badge
                        variant="outline"
                        className="ml-auto text-[10px] text-green-600"
                      >
                        ✓ Verified
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="ml-auto text-[10px] text-red-600"
                      >
                        ✗ Not Verified
                      </Badge>
                    )
                  }
                />
                <InfoField
                  icon={<ImageIcon className="h-3 w-3" />}
                  label="Avatar"
                  value={profile.profile.avatar_url ? "✓ Set" : "✗ None"}
                  color={profile.profile.avatar_url ? "green" : "red"}
                />
                <InfoField
                  icon={<Calendar className="h-3 w-3" />}
                  label="Created At"
                  value={
                    profile.profile.created_at
                      ? new Date(
                          profile.profile.created_at,
                        ).toLocaleDateString()
                      : null
                  }
                />
              </CardContent>
            </Card>

            {/* ===== MFA Status ===== */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4" />
                  Two-Step Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <div>
                      <p className="text-xs font-medium">MFA Status</p>
                      <p className="text-[10px] text-muted-foreground">
                        {profile.profile.is_mfa_enabled
                          ? "TOTP Authenticator"
                          : "Not configured"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      profile.profile.is_mfa_enabled ? "default" : "destructive"
                    }
                    className="text-[10px]"
                  >
                    {profile.profile.is_mfa_enabled
                      ? "✓ Enabled"
                      : "✗ Disabled"}
                  </Badge>
                </div>
                {!profile.profile.is_mfa_enabled && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
                    <p className="text-[10px] text-amber-800 dark:text-amber-200">
                      💡 <strong>Tip:</strong> Enable MFA for enhanced security
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 h-7 w-full text-xs"
                      onClick={() =>
                        (window.location.href = appRouter.twoFactorSetup)
                      }
                    >
                      Setup MFA
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ===== All Permissions ===== */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Key className="h-4 w-4" />
                  All Permissions ({profile.permissions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {profile.permissions.slice(0, 15).map((p) => (
                    <Badge
                      key={p}
                      variant="secondary"
                      className="text-[9px] font-mono"
                    >
                      {p}
                    </Badge>
                  ))}
                  {profile.permissions.length > 15 && (
                    <Badge variant="outline" className="text-[9px]">
                      +{profile.permissions.length - 15}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ===== Roles ===== */}
            <Card>
              <button
                onClick={toggleRoles}
                className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50"
              >
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4" />
                  Roles ({profile.roles.length})
                </CardTitle>
                {showRoles ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {showRoles && (
                <CardContent className="space-y-2 pt-0">
                  {profile.roles.length > 0 ? (
                    profile.roles.map((role, i) => (
                      <div
                        key={i}
                        className="rounded-lg border bg-muted/50 p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <Badge variant="default" className="text-xs">
                            {role.code}
                          </Badge>
                          {role.description && (
                            <span className="text-[10px] text-muted-foreground">
                              {role.description}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 8).map((p) => (
                            <Badge
                              key={p}
                              variant="outline"
                              className="text-[8px] font-mono"
                            >
                              {p}
                            </Badge>
                          ))}
                          {role.permissions.length > 8 && (
                            <Badge variant="outline" className="text-[8px]">
                              +{role.permissions.length - 8}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs text-muted-foreground py-4">
                      No roles assigned
                    </p>
                  )}
                </CardContent>
              )}
            </Card>

            {/* ===== Permission Checks ===== */}
            <Card>
              <button
                onClick={togglePerms}
                className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50"
              >
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Key className="h-4 w-4" />
                  Permission Checks
                </CardTitle>
                {showPerms ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {showPerms && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-2">
                    <PermCheck label="*:*" value={hasPermission("*:*")} />
                    <PermCheck label="admin" value={hasRole("admin")} />
                    <PermCheck label="vendor" value={hasRole("vendor")} />
                    <PermCheck label="customer" value={hasRole("customer")} />
                    <PermCheck label="delivery" value={hasRole("delivery")} />
                    <PermCheck label="support" value={hasRole("support")} />
                    <PermCheck
                      label="products:read"
                      value={hasPermission("products:read")}
                    />
                    <PermCheck
                      label="orders:create"
                      value={hasPermission("orders:create")}
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* ===== Raw JSON ===== */}
            <Card>
              <button
                onClick={toggleJson}
                className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50"
              >
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CodeIcon className="h-4 w-4" />
                  Raw JSON
                </CardTitle>
                {showJson ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {showJson && (
                <CardContent className="pt-0">
                  <pre className="max-h-96 overflow-auto rounded-lg bg-muted p-3 text-[9px] font-mono">
                    {JSON.stringify(
                      {
                        user: { id: user?.id, email: user?.email },
                        profile,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {!profile && !isLoading && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <User className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No profile data available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// Helper Components
// =====================================================

function InfoField({
  icon,
  label,
  value,
  color,
  badge,
  onCopy,
  copied,
  compact = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  color?: "green" | "red" | "blue";
  badge?: React.ReactNode;
  onCopy?: () => void;
  copied?: boolean;
  compact?: boolean;
}) {
  const valueColor =
    color === "green"
      ? "text-green-600"
      : color === "red"
        ? "text-red-600"
        : color === "blue"
          ? "text-blue-600"
          : "text-foreground";

  return (
    <div
      className={`flex items-center gap-2 ${compact ? "" : "rounded-lg border p-2"}`}
    >
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className={`text-xs font-medium ${valueColor}`}>{value || "—"}</p>
      </div>
      {badge}
      {onCopy && (
        <button
          onClick={onCopy}
          className="text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </button>
      )}
    </div>
  );
}

function PermCheck({
  label,
  value,
}: {
  label: string;
  value: boolean | string;
}) {
  const isOk = typeof value === "boolean" ? value : !!value;
  return (
    <div className="flex items-center justify-between rounded-lg border px-2 py-1.5">
      <span className="text-[10px] font-mono text-muted-foreground">
        {label}
      </span>
      <span className={isOk ? "text-green-600" : "text-red-600"}>
        {typeof value === "string" ? (
          <Badge
            variant={value ? "default" : "destructive"}
            className="text-[9px]"
          >
            {value}
          </Badge>
        ) : (
          <Badge
            variant={isOk ? "default" : "destructive"}
            className="text-[9px]"
          >
            {value ? "✓" : "✗"}
          </Badge>
        )}
      </span>
    </div>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
