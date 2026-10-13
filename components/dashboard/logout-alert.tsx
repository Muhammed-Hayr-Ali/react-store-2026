"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LogOutIcon } from "lucide-react"
import React from "react"
import { Spinner } from "../ui/spinner"
import { signOut } from "@/lib/actions/authentication"
import { appRoutes } from "@/lib/config/app-routes"
import { useRouter } from "next/navigation"

interface LogoutAlertDialogProps {
  status: string | null
  onOpenChange: (open: boolean) => void
}

export function LogoutAlertDialog({
  status,
  onOpenChange,
}: LogoutAlertDialogProps) {
  // Track the pending sign-out request and access client navigation.
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  // Sign out, close the dialog, and return to the storefront.
  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault() // Keep the dialog open until the sign-out request finishes.
    setIsLoading(true)

    try {
      const result = await signOut()
      if (result.success) {
        onOpenChange(false) // Close the dialog after a successful sign-out.
        router.replace(appRoutes.home)
        router.refresh()
      }
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Render the confirmation dialog and its pending or idle actions.
  return (
    <AlertDialog open={status === "logout"} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <LogOutIcon />
          </AlertDialogMedia>

          <AlertDialogTitle>Logout from your account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to logout from your account?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 size-4" />
                Logging out...
              </>
            ) : (
              "Yes, Logout"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
