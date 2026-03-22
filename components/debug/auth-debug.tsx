"use client"

import { useAuth } from "@/lib/providers/auth-provider"


/**
 * Component for debugging auth state
 * Display current auth status, user, and profile data
 */
export function AuthDebug() {
  const { user, profile, status, isLoading, isAuthenticated } = useAuth()

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border bg-background p-4 text-xs shadow-lg">
      <h3 className="mb-2 font-semibold">Auth Debug</h3>
      
      <div className="space-y-2">
        <div>
          <span className="text-muted-foreground">Status:</span>{" "}
          <span
            className={
              status === "authenticated"
                ? "text-green-500"
                : status === "unauthenticated"
                  ? "text-red-500"
                  : "text-yellow-500"
            }
          >
            {status}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground">Is Loading:</span>{" "}
          <span>{isLoading ? "Yes" : "No"}</span>
        </div>

        <div>
          <span className="text-muted-foreground">Is Authenticated:</span>{" "}
          <span>{isAuthenticated ? "Yes" : "No"}</span>
        </div>

        <div className="border-t pt-2">
          <span className="text-muted-foreground">User:</span>{" "}
          <pre className="mt-1 max-h-20 overflow-auto bg-muted p-1">
            {user
              ? JSON.stringify(
                  { id: user.id, email: user.email },
                  null,
                  2
                )
              : "null"}
          </pre>
        </div>

        <div className="border-t pt-2">
          <span className="text-muted-foreground">Profile:</span>{" "}
          <pre className="mt-1 max-h-32 overflow-auto bg-muted p-1">
            {profile ? JSON.stringify(profile, null, 2) : "null"}
          </pre>
        </div>

        {profile && (
          <div className="border-t pt-2">
            <span className="text-muted-foreground">Full Name:</span>{" "}
            <span className="text-green-500">
              {profile.full_name || "Not set"}
            </span>
          </div>
        )}

        {profile && (
          <div>
            <span className="text-muted-foreground">Email:</span>{" "}
            <span className="text-green-500">
              {profile.email || "Not set"}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
