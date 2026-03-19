import { AppLogo } from "../shared/app-logo"
import { UserIcon } from "../shared/icons"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"

export default function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 lg:px-0">
        <div className="grow-3">
          <AppLogo size="sm" />
        </div>
        <Button
          variant={"secondary"}
          className="grow-7 text-sm text-muted-foreground"
        >
          Search
        </Button>
        <nav className="flex grow-3 items-center justify-end">
          <Avatar size="default">
            <AvatarFallback>
              <UserIcon className="size-5" />
            </AvatarFallback>
          </Avatar>
        </nav>
      </div>
    </header>
  )
}
