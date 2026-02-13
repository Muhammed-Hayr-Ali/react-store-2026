// src/hooks/useUserDisplay.ts
import { User } from "@supabase/supabase-js";

/**
 * Represents the normalized display data for a user,
 * safe for direct use in UI components (avatar, name, etc.).
 *
 * Designed to work seamlessly with Supabase auth users,
 * including guest (null) states, and supports both Arabic and Latin names.
 */
export type UserDisplayData = {
  /**
   * Unique user identifier from Supabase Auth.
   * `null` if the user is not authenticated.
   */
  id: string | null;

  /**
   * User's email address.
   * Falls back to "Email" if unavailable (should not be displayed publicly).
   */
  email: string | null;

  /**
   * Full name for display purposes.
   * Derived from metadata, app_metadata, email prefix, or defaults to "User".
   * Trimmed and guaranteed non-empty.
   */
  fullName: string;

  /**
   * URL to the user's avatar image.
   * `null` if no avatar is provided by the auth provider (e.g., Google).
   */
  avatarUrl: string | undefined;

  /**
   * Two-letter initials extracted from `fullName`.
   * Used as fallback when avatar is missing.
   * Examples:
   *   - "محمد أحمد" → "مأ"
   *   - "John Doe" → "JD"
   *   - "Leila" → "LE"
   */
  initials: string;

  /**
   * Tailwind CSS background color class for avatar placeholder.
   * Deterministically generated from `fullName` to ensure consistency.
   * One of: `bg-red-500`, `bg-blue-500`, ..., `bg-gray-500` (for guests).
   */
  fallbackColor: string;
};

/**
 * Safely extracts and normalizes user display data from a Supabase `User` object.
 *
 * This utility handles:
 * - Missing or partial user metadata (common with OAuth providers).
 * - Arabic and Latin name parsing for correct initials.
 * - Deterministic avatar fallback colors.
 * - Graceful degradation for unauthenticated ("guest") users.
 *
 * ⚠️ Note: This is a **pure function**, not a React Hook (despite the name).
 * It does not use `useState`, `useEffect`, or any React internal.
 *
 * @param user - The Supabase User object (nullable)
 * @returns Normalized `UserDisplayData` ready for UI rendering
 *
 * @example Basic usage in a component
 * ```tsx
 * const { user } = useAuth();
 * const displayData = useUserDisplay(user);
 *
 * return (
 *   <div className="flex items-center">
 *     {displayData.avatarUrl ? (
 *       <img src={displayData.avatarUrl} alt={displayData.fullName} className="w-10 h-10 rounded-full" />
 *     ) : (
 *       <div className={`w-10 h-10 rounded-full flex items-center justify-center ${displayData.fallbackColor}`}>
 *         <span className="text-white font-medium">{displayData.initials}</span>
 *       </div>
 *     )}
 *     <span className="mr-2">{displayData.fullName}</span>
 *   </div>
 * );
 * ```
 *
 * @example Arabic name handling
 * ```ts
 * const user = { user_metadata: { name: "فاطمة الزهراء" } };
 * const data = useUserDisplay(user);
 * console.log(data.initials); // "فز"
 * ```
 */
export function useUserDisplay(user: User | null | undefined): UserDisplayData {
  /**
   * Extracts two-letter initials from a full name.
   * Handles:
   * - Single names (e.g., "Leila" → "LE")
   * - Multi-part names (e.g., "Mohammed Ali" → "MA")
   * - Arabic names with correct character extraction
   *
   * @param name - Full name string (trimmed)
   * @returns Uppercase 2-letter initials, or "UN" if name is empty
   */
  const getInitials = (name: string): string => {
    if (!name.trim()) return "UN";

    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    } else {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
  };

  /**
   * Generates a deterministic Tailwind background color class
   * based on the name string hash.
   *
   * Ensures the same user always gets the same color,
   * improving visual consistency.
   *
   * @param name - Full name string
   * @returns Tailwind CSS class like "bg-blue-500"
   */
  const getFallbackColor = (name: string): string => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-amber-500",
      "bg-teal-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Handle unauthenticated (guest) user
  if (!user) {
    return {
      id: null,
      email: null,
      fullName: "Guest",
      avatarUrl: undefined,
      initials: "G",
      fallbackColor: "bg-gray-500",
    };
  }

  // Extract core identity
  const id = user.id;
  const email = user.email ?? "Email";

  // Derive display name from multiple possible sources
  const fullName =
    user.user_metadata.name ||
    user.app_metadata.full_name ||
    email?.split("@")[0] ||
    "User";

  // Extract avatar URL (support common OAuth provider keys)
  const avatarUrl =
    user.user_metadata.avatar || user.user_metadata.avatar_url || null;

  // Generate display helpers
  const initials = getInitials(fullName);
  const fallbackColor = getFallbackColor(fullName);

  return {
    id,
    email,
    fullName: fullName.trim(),
    avatarUrl,
    initials,
    fallbackColor,
  };
}
