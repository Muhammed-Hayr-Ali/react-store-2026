import { Button } from "@/components/ui/button"
import { FieldDescription } from "@/components/ui/field"
import { appRoutes } from "@/lib/config/app-routes"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

type Props = {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <main className="flex min-h-svh w-full flex-col items-center gap-6">
      <div className="flex w-full px-2 pt-2 md:hidden">
        <Button variant="ghost" size="icon-sm" className="p-0" asChild>
          <Link href={appRoutes.home}>
            <ArrowLeft className="rtl:rotate-180" />
          </Link>
        </Button>
      </div>
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        <div className="flex w-full max-w-sm flex-col">{children}</div>
      </div>
      <FieldDescription className="text-center text-[10px]">
        By continuing, you agree to the{" "}
        <Link className="text-primary hover:underline" href="#">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link className="text-primary hover:underline" href="#">
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </main>
  )
}





