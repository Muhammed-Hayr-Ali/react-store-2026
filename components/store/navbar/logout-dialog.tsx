"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"

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
import { Spinner } from "@/components/ui/spinner"
import { signOut } from "@/lib/actions/authentication/signOut"
import { appRoutes } from "@/lib/config/app-routes"

interface LogoutDialogProps {
  status: string | null
  onOpenChange: (open: boolean) => void
}

export function LogoutDialog({ status, onOpenChange }: LogoutDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signOut()
      if (result.success) {
        onOpenChange(false)
        router.replace(appRoutes.home)
        router.refresh()
      }
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

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
                <Spinner className="me-2 size-4" />
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
