import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CustomButton } from "@/components/ui/custom-button"
import { CurrentUser } from "@/lib/actions/utils/profile"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"

interface UserProfileProps {
  className?: string
  user: CurrentUser | null
}

export default function UserProfile({ user, className }: UserProfileProps) {
  if (!user) return <></>
  return (
    <div className={cn("flex items-center space-x-4 p-2", className)}>
      <Avatar className="size-18">
        <AvatarImage src={user.profile_image} />
        <AvatarFallback className="p-4">
          <User className="h-full w-full" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-1 flex-col items-start justify-center">
        <p className="text-sm font-semibold text-foreground">
          {user?.first_name || "Guest"}
        </p>
        <p className="text-xs text-muted-foreground">
          {user?.email || "Not logged in"}
        </p>
        {user.role == "admin" && (
          <p className="text-xs text-muted-foreground">Welcome Admin</p>
        )}
      </div>
      <NotificationButton />
    </div>
  )
}

function NotificationButton() {
  return (
    <div className="relative">
      <div className="absolute top-0 right-0 z-50 h-2 w-2 rounded-full bg-green-500 dark:bg-green-400 rtl:right-auto rtl:left-0" />
      <CustomButton variant="secondary" size="icon-lg" className="p-1.5" asChild>
        <svg
          xmlns="http://www.w3.org/2000/svg"

          viewBox="0 0 256 256"
          className="fill-foreground"
        >
          <path d="M168,224a8,8,0,0,1-8,8H96a8,8,0,1,1,0-16h64A8,8,0,0,1,168,224Zm53.85-32A15.8,15.8,0,0,1,208,200H48a16,16,0,0,1-13.8-24.06C39.75,166.38,48,139.34,48,104a80,80,0,1,1,160,0c0,35.33,8.26,62.38,13.81,71.94A15.89,15.89,0,0,1,221.84,192ZM208,184c-7.73-13.27-16-43.95-16-80a64,64,0,1,0-128,0c0,36.06-8.28,66.74-16,80Z"></path>
        </svg>
      </CustomButton>
    </div>
  )
}
