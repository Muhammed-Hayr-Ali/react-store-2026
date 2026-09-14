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

// handle logout
const handleLogout = async () => {
  setIsLoading(true)
  try {
    await signOut()
  } catch (error) {
    console.error("Error signing out:", error)
  } finally {
    setIsLoading(false)
    onOpenChange(false)
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
