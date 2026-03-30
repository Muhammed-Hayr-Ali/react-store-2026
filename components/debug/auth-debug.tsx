"use client"

import { useAuth } from "@/lib/providers/auth-provider"
import { useState } from "react"

/**
 * Component for debugging auth state
 * Display current auth status, user, and profile data
 */
export function AuthDebug() {
  const {
    user,
    profile,
    status,
    isLoading,
    isAuthenticated,
    hasPermission,
    hasRole,
    hasActivePlan,
    refreshProfile,
  } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showJson, setShowJson] = useState(false)

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshProfile()
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("ar-SA", {
      timeZone: "Asia/Riyadh",
    })
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 max-h-[80vh] w-lg overflow-auto rounded-lg border bg-background p-4 text-xs shadow-lg">
      <div className="mb-3 flex items-center justify-between border-b pb-2">
        <h3 className="font-semibold">🔐 Auth Debug</h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground disabled:opacity-50"
        >
          {isRefreshing ? "⟳ Loading..." : "⟳ Refresh"}
        </button>
      </div>

      <div className="space-y-3">
        {/* ==================== Auth Status ==================== */}
        <div className="rounded bg-muted p-2">
          <div className="mb-1 font-semibold">📊 Auth Status</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Status:</span>{" "}
              <span
                className={
                  status === "authenticated"
                    ? "font-medium text-green-500"
                    : status === "unauthenticated"
                      ? "text-red-500"
                      : "text-yellow-500"
                }
              >
                {status}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Loading:</span>{" "}
              <span>{isLoading ? "⏳ Yes" : "✓ No"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Authenticated:</span>{" "}
              <span>{isAuthenticated ? "✓ Yes" : "✗ No"}</span>
            </div>
          </div>
        </div>

        {/* ==================== User Info ==================== */}
        <div className="rounded bg-muted p-2">
          <div className="mb-1 font-semibold">👤 User Info</div>
          <div className="space-y-1">
            <div>
              <span className="text-muted-foreground">ID:</span>{" "}
              <span className="font-mono text-[10px]">{user?.id || "N/A"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>{" "}
              <span className="text-green-500">{user?.email || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* ==================== Profile Basic Info ==================== */}
        {profile && (
          <div className="rounded bg-muted p-2">
            <div className="mb-1 font-semibold">📋 Profile Information</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Full Name:</span>{" "}
                <span className="text-green-500">
                  {profile.full_name || "Not set"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">First Name:</span>{" "}
                <span>{profile.first_name || "Not set"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Name:</span>{" "}
                <span>{profile.last_name || "Not set"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                <span className="text-green-500">{profile.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>{" "}
                <span>{profile.phone || "Not set"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Provider:</span>{" "}
                <span>{profile.provider}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Bio:</span>{" "}
                <span className="text-[10px]">{profile.bio || "Not set"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Avatar:</span>{" "}
                <span className="text-[10px]">
                  {profile.avatar_url ? "✓ Set" : "✗ None"}
                </span>
              </div>
            </div>
            <div className="mt-2 flex gap-1">
              {profile.email_verified && (
                <span className="rounded bg-green-500/20 px-1 text-green-500">
                  ✉ Email ✓
                </span>
              )}
              {profile.phone_verified && (
                <span className="rounded bg-green-500/20 px-1 text-green-500">
                  📱 Phone ✓
                </span>
              )}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
              <div>
                <span>Created:</span>{" "}
                <span>{formatDate(profile.created_at)}</span>
              </div>
              <div>
                <span>Updated:</span>{" "}
                <span>{formatDate(profile.updated_at)}</span>
              </div>
              <div>
                <span>Last Sign In:</span>{" "}
                <span>{formatDate(profile.last_sign_in_at)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== Setup Status ==================== */}
        {profile && (
          <div className="rounded bg-muted p-2">
            <div className="mb-1 font-semibold">⚙️ Setup Status</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Has Profile:</span>{" "}
                <span
                  className={
                    profile.user_id ? "text-green-500" : "text-red-500"
                  }
                >
                  {profile.user_id ? "✓ Yes" : "✗ No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Has Active Role:</span>{" "}
                <span
                  className={
                    profile.has_active_role ? "text-green-500" : "text-red-500"
                  }
                >
                  {profile.has_active_role ? "✓ Yes" : "✗ No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Has Active Plan:</span>{" "}
                <span
                  className={
                    profile.has_active_plan ? "text-green-500" : "text-red-500"
                  }
                >
                  {profile.has_active_plan ? "✓ Yes" : "✗ No"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-1">
                <span className="font-medium">Is Fully Setup:</span>{" "}
                <span
                  className={
                    profile.is_fully_setup
                      ? "font-medium text-green-500"
                      : "text-yellow-500"
                  }
                >
                  {profile.is_fully_setup ? "✓ Yes ✓" : "⚠ Incomplete"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== Roles ==================== */}
        {profile && profile.roles.length > 0 && (
          <div className="rounded bg-muted p-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-semibold">
                🎭 Roles ({profile.roles.length})
              </span>
            </div>
            {profile.roles.map((role, index) => (
              <div
                key={`${role.role_id}-${index}`}
                className="mb-1 rounded bg-background p-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{role.role_name}</span>
                  <span
                    className={
                      role.is_active ? "text-green-500" : "text-red-500"
                    }
                  >
                    {role.is_active ? "✓ Active" : "✗ Inactive"}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  {role.description || "No description"}
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  <div>Permissions: {role.permissions?.length || 0}</div>
                  <div>Granted: {formatDate(role.granted_at)}</div>
                </div>
                {role.permissions && role.permissions.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {role.permissions.slice(0, 5).map((perm: string) => (
                      <span
                        key={`${perm}-${index}`}
                        className="rounded bg-orange-500/20 px-1 text-[9px] text-orange-500"
                      >
                        {perm}
                      </span>
                    ))}
                    {role.permissions.length > 5 && (
                      <span className="text-[9px] text-muted-foreground">
                        +{role.permissions.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ==================== Role Names Tags ==================== */}
        {profile && profile.role_names.length > 0 && (
          <div className="rounded bg-muted p-2">
            <div className="mb-1 font-semibold">🏷️ Role Names</div>
            <div className="flex flex-wrap gap-1">
              {profile.role_names.map((name) => (
                <span
                  key={name}
                  className="rounded bg-blue-500/20 px-1 text-blue-500"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ==================== Role Permissions (JSONB) ==================== */}
        {profile && profile.role_permissions && (
          <details className="rounded bg-muted p-2">
            <summary className="cursor-pointer font-semibold">
              🔑 Role Permissions (
              {Array.isArray(profile.role_permissions)
                ? profile.role_permissions.length
                : "N/A"}
              )
            </summary>
            <div className="mt-2 flex flex-wrap gap-1">
              {Array.isArray(profile.role_permissions) &&
                profile.role_permissions.slice(0, 30).map((perm: string) => (
                  <span
                    key={perm}
                    className="rounded bg-orange-500/20 px-1 text-[9px] text-orange-500"
                  >
                    {perm}
                  </span>
                ))}
              {Array.isArray(profile.role_permissions) &&
                profile.role_permissions.length > 30 && (
                  <span className="text-[9px] text-muted-foreground">
                    +{profile.role_permissions.length - 30} more
                  </span>
                )}
            </div>
          </details>
        )}

        {/* ==================== Plans ==================== */}
        {profile && profile.plans.length > 0 && (
          <div className="rounded bg-muted p-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-semibold">
                📦 Plans ({profile.plans.length})
              </span>
            </div>
            {profile.plans.map((plan, index) => (
              <div
                key={`${plan.plan_id}-${index}`}
                className="mb-1 rounded bg-background p-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{plan.plan_name}</span>
                  <span
                    className={
                      plan.status === "active"
                        ? "text-green-500"
                        : plan.status === "trial"
                          ? "text-blue-500"
                          : "text-yellow-500"
                    }
                  >
                    {plan.status === "active" && "✓ "}
                    {plan.status === "trial" && "🧪 "}
                    {plan.status}
                  </span>
                </div>
                <div className="mt-1 grid grid-cols-2 gap-1 text-[10px]">
                  <div>
                    <span className="text-muted-foreground">Category:</span>{" "}
                    <span>{plan.category}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price:</span>{" "}
                    <span>${plan.price}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Billing:</span>{" "}
                    <span>{plan.billing_period}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Start:</span>{" "}
                    <span className="text-[9px]">
                      {formatDate(plan.start_date)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End:</span>{" "}
                    <span className="text-[9px]">
                      {formatDate(plan.end_date)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trial End:</span>{" "}
                    <span className="text-[9px]">
                      {formatDate(plan.trial_end_date)}
                    </span>
                  </div>
                </div>
                {plan.permissions &&
                  Object.keys(plan.permissions).length > 0 && (
                    <div className="mt-1">
                      <div className="text-[10px] text-muted-foreground">
                        Permissions: {Object.keys(plan.permissions).length}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(plan.permissions)
                          .filter(([_, value]) => value === true)
                          .slice(0, 5)
                          .map(([key], permIndex) => (
                            <span
                              key={`${key}-${index}-${permIndex}`}
                              className="rounded bg-purple-500/20 px-1 text-[9px] text-purple-500"
                            >
                              {key}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}

        {/* ==================== Active Plan Info ==================== */}
        {profile && (
          <div className="rounded bg-muted p-2">
            <div className="mb-1 font-semibold">⭐ Active Plan</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Name:</span>{" "}
                <span className="text-green-500">
                  {profile.active_plan_name || "None"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                <span>{profile.active_plan_status || "N/A"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Has Active Plan:</span>{" "}
                <span
                  className={
                    profile.has_active_plan ? "text-green-500" : "text-red-500"
                  }
                >
                  {hasActivePlan() ? "✓ Yes" : "✗ No"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Test hasActivePlan:
                </span>{" "}
                <span
                  className={
                    hasActivePlan(profile.active_plan_name || undefined)
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {hasActivePlan(profile.active_plan_name || undefined)
                    ? "✓ Pass"
                    : "✗ Fail"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== Plan Permissions ==================== */}
        {profile && profile.plan_permissions && (
          <details className="rounded bg-muted p-2">
            <summary className="cursor-pointer font-semibold">
              🎫 Plan Permissions (
              {Object.keys(profile.plan_permissions).length})
            </summary>
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(profile.plan_permissions)
                .filter(([_, value]) => value === true)
                .map(([key]) => (
                  <span
                    key={key}
                    className="rounded bg-purple-500/20 px-1 text-[9px] text-purple-500"
                  >
                    {key}
                  </span>
                ))}
            </div>
          </details>
        )}

        {/* ==================== All Permissions ==================== */}
        {profile && profile.all_permissions && (
          <details className="rounded bg-muted p-2">
            <summary className="cursor-pointer font-semibold">
              🔐 All Permissions (
              {Array.isArray(profile.all_permissions)
                ? profile.all_permissions.length
                : "N/A"}
              )
            </summary>
            <div className="mt-2 flex flex-wrap gap-1">
              {Array.isArray(profile.all_permissions) &&
                profile.all_permissions.slice(0, 50).map((perm: string) => (
                  <span
                    key={perm}
                    className="rounded bg-emerald-500/20 px-1 text-[9px] text-emerald-500"
                  >
                    {perm}
                  </span>
                ))}
              {Array.isArray(profile.all_permissions) &&
                profile.all_permissions.length > 50 && (
                  <span className="text-[9px] text-muted-foreground">
                    +{profile.all_permissions.length - 50} more
                  </span>
                )}
            </div>
          </details>
        )}

        {/* ==================== Permission Checkers ==================== */}
        {profile && (
          <div className="rounded bg-muted p-2">
            <div className="mb-1 font-semibold">🧪 Permission Checkers</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">
                  hasPermission(`*:*`):
                </span>{" "}
                <span
                  className={
                    hasPermission("*:*") ? "text-green-500" : "text-red-500"
                  }
                >
                  {hasPermission("*:*") ? "✓ Yes" : "✗ No"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">hasRole(`admin`):</span>{" "}
                <span
                  className={
                    hasRole("admin") ? "text-green-500" : "text-red-500"
                  }
                >
                  {hasRole("admin") ? "✓ Yes" : "✗ No"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">hasActivePlan():</span>{" "}
                <span
                  className={
                    hasActivePlan() ? "text-green-500" : "text-red-500"
                  }
                >
                  {hasActivePlan() ? "✓ Yes" : "✗ No"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  hasActivePlan(plan):
                </span>{" "}
                <span
                  className={
                    hasActivePlan(profile.active_plan_name || undefined)
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {hasActivePlan(profile.active_plan_name || undefined)
                    ? "✓ Yes"
                    : "✗ No"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== Raw Profile JSON ==================== */}
        {profile && (
          <details
            open={showJson}
            onToggle={(e) => setShowJson(e.currentTarget.open)}
            className="rounded bg-muted p-2"
          >
            <summary className="cursor-pointer font-semibold">
              📄 Raw Profile JSON
            </summary>
            <pre className="mt-2 max-h-96 overflow-auto bg-background p-1 text-[9px]">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </details>
        )}

        {/* ==================== Raw User JSON ==================== */}
        {user && (
          <details className="rounded bg-muted p-2">
            <summary className="cursor-pointer font-semibold">
              📄 Raw User JSON
            </summary>
            <pre className="mt-2 max-h-64 overflow-auto bg-background p-1 text-[9px]">
              {JSON.stringify(
                { id: user.id, email: user.email, created_at: user.created_at },
                null,
                2
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
