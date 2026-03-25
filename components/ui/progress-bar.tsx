"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * @interface PureProgressBarProps
 * @description Props for the pure progress bar component
 */
interface PureProgressBarProps {
  /**
   * Show or hide the progress bar
   * @default true
   */
  isVisible?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * @component PureProgressBar
 * @description A minimal, pure progress bar with sharp edges and smooth continuous animation
 * Perfect for upload and processing operations
 *
 * Features:
 * - Sharp edges (no border-radius)
 * - Smooth continuous animation
 * - Minimal and elegant design
 * - Dark mode support
 * - Lightweight and performant
 *
 * @example
 * ```tsx
 * // Basic usage
 * <PureProgressBar isVisible={isUploading} />
 *
 * @example
 * ```tsx
 * // With custom className
 * <PureProgressBar isVisible={isLoading} className="mt-2" />
 * ```
 */
const ProgressBar = React.forwardRef<HTMLDivElement, PureProgressBarProps>(
  ({ isVisible = true, className }, ref) => {
    if (!isVisible) return null

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-1 w-full overflow-hidden bg-zinc-200/50 dark:bg-zinc-800/50",
          className
        )}
      >
        {/* Animated progress bar */}
        <div
          className="absolute inset-y-0 left-0 w-1/3 bg-zinc-600 dark:bg-zinc-400"
          style={{
            animation: `slideInfinite 2s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
          }}
        />

        {/* CSS Animation */}
        <style>{`
          @keyframes slideInfinite {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(400%);
            }
          }
        `}</style>
      </div>
    )
  }
)

ProgressBar.displayName = "PureProgressBar"

export { ProgressBar }
export type { PureProgressBarProps }
