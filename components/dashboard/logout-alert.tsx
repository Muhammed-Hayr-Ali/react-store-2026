"use client"

import {
  CustomAlertDialog,
  CustomAlertDialogAction,
  CustomAlertDialogCancel,
  CustomAlertDialogContent,
  CustomAlertDialogDescription,
  CustomAlertDialogFooter,
  CustomAlertDialogHeader,
  CustomAlertDialogMedia,
  CustomAlertDialogTitle,
} from "@/components/ui/custom-alert-dialog"
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
    <CustomAlertDialog open={staus === "logout"} onOpenChange={onOpenChange}>
      <CustomAlertDialogContent>
        <CustomAlertDialogHeader>
          <CustomAlertDialogMedia>
            <LogOutIcon />
          </CustomAlertDialogMedia>

          <CustomAlertDialogTitle>
            Logout from your account
          </CustomAlertDialogTitle>
          <CustomAlertDialogDescription>
            Are you sure you want to logout from your account?
          </CustomAlertDialogDescription>
        </CustomAlertDialogHeader>
        <CustomAlertDialogFooter>
          <CustomAlertDialogCancel>Cancel</CustomAlertDialogCancel>
          <CustomAlertDialogAction variant="destructive" onClick={handleLogout}>
            {isLoading ? <Spinner /> : "Yes, Logout"}
          </CustomAlertDialogAction>
        </CustomAlertDialogFooter>
      </CustomAlertDialogContent>
    </CustomAlertDialog>
  )
}
