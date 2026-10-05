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
import { signOut } from "@/lib/actions/authentication/signOut"
import { appRoutes } from "@/lib/config/app-routes"
import { useRouter } from "next/navigation"

interface LogoutAlertDialogProps {
  staus: string | null
  data?: unknown
  onOpenChange: (open: boolean) => void
}

export function LogoutAlertDialog({
  staus,
  onOpenChange,
}: LogoutAlertDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const result = await signOut()
      if (result.success) {
        router.replace(appRoutes.home)
        router.refresh()
      }
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AlertDialog open={staus === "logout"} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <LogOutIcon />
          </AlertDialogMedia>

          <AlertDialogTitle>
            Logout from your account
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to logout from your account?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleLogout}>
            {isLoading ? <Spinner /> : "Yes, Logout"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
