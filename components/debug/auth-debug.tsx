"use client"

import { useAuth } from "@/lib/providers/auth-provider"
import { useState } from "react"

/**
 * 🔐 Auth Debug Component
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
    hasActivePlan,
    getActivePlan,
    refresh,
    signOut,
  } = useAuth()

  const [showJson, setShowJson] = useState(false)
  const [showRoles, setShowRoles] = useState(true)
  const [showSubs, setShowSubs] = useState(true)
  const [showPerms, setShowPerms] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  if (process.env.NODE_ENV !== "development") return null

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatDate = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleDateString("ar-SA") : "—"

  return (
    <div className="fixed right-4 bottom-4 z-50 max-h-[80vh] w-lg overflow-auto rounded-lg border bg-background p-4 text-xs shadow-lg">
      {/* ===== Header ===== */}
      <div className="mb-3 flex items-center justify-between border-b pb-2">
        <h3 className="font-semibold">🔐 Auth Debug</h3>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground disabled:opacity-50"
          >
            {isRefreshing ? "⟳ Loading..." : "⟳ Refresh"}
          </button>
          {isAuthenticated && (
            <button
              onClick={signOut}
              className="text-destructive-foreground rounded bg-destructive px-2 py-1 text-xs"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* ===== Status ===== */}
      <div className="mb-3 rounded bg-muted p-2">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-muted-foreground">Status:</span>{" "}
            <span
              className={
                isAuthenticated ? "font-medium text-green-500" : "text-red-500"
              }
            >
              {isAuthenticated ? "✓ Authenticated" : "✗ Anonymous"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Loading:</span>{" "}
            <span>{isLoading ? "⏳ Yes" : "✓ No"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>{" "}
            <span className="text-green-500">{user?.email ?? "—"}</span>
          </div>
        </div>
      </div>

      {profile && (
        <div className="space-y-3">
          {/* ===== البروفايل ===== */}
          <div className="rounded bg-muted p-2">
            <div className="mb-1 font-semibold">📋 Profile</div>
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="ID"
                value={profile.profile.id?.slice(0, 8) + "..."}
              />
              <Field label="Email" value={profile.profile.email} />
              <Field label="Full Name" value={profile.profile.full_name} />
              <Field label="First Name" value={profile.profile.first_name} />
              <Field label="Last Name" value={profile.profile.last_name} />
              <Field label="Phone" value={profile.profile.phone_number} />
              <Field
                label="Language"
                value={profile.profile.preferred_language}
              />
              <Field label="Timezone" value={profile.profile.timezone} />
              <Field
                label="Verified"
                value={profile.profile.is_phone_verified ? "✓" : "✗"}
              />
              <Field
                label="Avatar"
                value={profile.profile.avatar_url ? "✓ Set" : "✗ None"}
              />
            </div>
          </div>

          {/* ===== الصلاحيات الكلية ===== */}
          <div className="rounded bg-muted p-2">
            <div className="mb-1 font-semibold">🔑 All Permissions</div>
            <div className="flex flex-wrap gap-1">
              {profile.permissions.map((p) => (
                <span
                  key={p}
                  className="rounded bg-emerald-500/20 px-1 text-[9px] text-emerald-500"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* ===== الأدوار ===== */}
          <details
            open={showRoles}
            onToggle={(e) => setShowRoles(e.currentTarget.open)}
            className="rounded bg-muted p-2"
          >
            <summary className="cursor-pointer font-semibold">
              🎭 Roles ({profile.roles.length})
            </summary>
            <div className="mt-2 space-y-2">
              {profile.roles.map((role, i) => (
                <div key={i} className="rounded bg-background p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{role.code}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {role.description || "—"}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {role.permissions.slice(0, 5).map((p) => (
                      <span
                        key={p}
                        className="rounded bg-orange-500/20 px-1 text-[9px] text-orange-500"
                      >
                        {p}
                      </span>
                    ))}
                    {role.permissions.length > 5 && (
                      <span className="text-[9px] text-muted-foreground">
                        +{role.permissions.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {profile.roles.length === 0 && (
                <div className="text-muted-foreground">لا توجد أدوار</div>
              )}
            </div>
          </details>

          {/* ===== الاشتراكات ===== */}
          <details
            open={showSubs}
            onToggle={(e) => setShowSubs(e.currentTarget.open)}
            className="rounded bg-muted p-2"
          >
            <summary className="cursor-pointer font-semibold">
              📦 Subscriptions ({profile.subscriptions.length})
            </summary>
            <div className="mt-2 space-y-2">
              {profile.subscriptions.map((sub, i) => (
                <div key={i} className="rounded bg-background p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{sub.name_ar}</span>
                    <span
                      className={
                        sub.status === "active"
                          ? "text-green-500"
                          : sub.status === "trialing"
                            ? "text-blue-500"
                            : "text-yellow-500"
                      }
                    >
                      {sub.status}
                    </span>
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                    <span>
                      Category: <b>{sub.category}</b>
                    </span>
                    <span>
                      Price: <b>${sub.price}</b>
                    </span>
                    <span>
                      Billing: <b>{sub.billing_cycle}</b>
                    </span>
                    <span>
                      Auto-renew: <b>{sub.auto_renew ? "✓" : "✗"}</b>
                    </span>
                    {sub.ends_at && (
                      <span className="col-span-2">
                        Ends: <b>{formatDate(sub.ends_at)}</b>
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {sub.permissions.slice(0, 5).map((p) => (
                      <span
                        key={p}
                        className="rounded bg-purple-500/20 px-1 text-[9px] text-purple-500"
                      >
                        {p}
                      </span>
                    ))}
                    {sub.permissions.length > 5 && (
                      <span className="text-[9px] text-muted-foreground">
                        +{sub.permissions.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {profile.subscriptions.length === 0 && (
                <div className="text-muted-foreground">
                  لا توجد اشتراكات نشطة
                </div>
              )}
            </div>
          </details>

          {/* ===== اختبار الصلاحيات ===== */}
          <details
            open={showPerms}
            onToggle={(e) => setShowPerms(e.currentTarget.open)}
            className="rounded bg-muted p-2"
          >
            <summary className="cursor-pointer font-semibold">
              🧪 Permission Checks
            </summary>
            <div className="mt-2 grid grid-cols-2 gap-2">
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
              <PermCheck label="active plan" value={hasActivePlan()} />
              <PermCheck
                label="active plan name"
                value={getActivePlan()?.name_ar ?? "—"}
              />
            </div>
          </details>

          {/* ===== Raw JSON ===== */}
          <details
            open={showJson}
            onToggle={(e) => setShowJson(e.currentTarget.open)}
            className="rounded bg-muted p-2"
          >
            <summary className="cursor-pointer font-semibold">
              📄 Raw JSON
            </summary>
            <pre className="mt-2 max-h-96 overflow-auto bg-background p-2 text-[9px]">
              {JSON.stringify(
                {
                  user: { id: user?.id, email: user?.email },
                  profile,
                },
                null,
                2
              )}
            </pre>
          </details>
        </div>
      )}

      {!profile && !isLoading && (
        <div className="text-muted-foreground">لا توجد بيانات بروفايل</div>
      )}
    </div>
  )
}

// =====================================================
// Helpers
// =====================================================

function Field({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div>
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="text-green-500">{value ?? "—"}</span>
    </div>
  )
}

function PermCheck({
  label,
  value,
}: {
  label: string
  value: boolean | string
}) {
  const isOk = typeof value === "boolean" ? value : !!value
  return (
    <div>
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className={isOk ? "text-green-500" : "text-red-500"}>
        {typeof value === "string" ? value : value ? "✓" : "✗"}
      </span>
    </div>
  )
}
