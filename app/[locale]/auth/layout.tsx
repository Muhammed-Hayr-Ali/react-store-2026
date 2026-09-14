import { CustomButton } from "@/components/ui/custom-button"
import { FieldDescription } from "@/components/ui/field"
import { getCurrentUser } from "@/lib/actions/utils/profile"
import { appRoutes } from "@/lib/config/app-routes"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

type Props = {
  children: React.ReactNode
}

export default async function AuthLayout({ children }: Props) {
  const user = await getCurrentUser()

  if (user) {
    redirect("/")
  }

  return (
    <main className="flex min-h-svh w-full flex-col items-center gap-6">
      <div className="flex w-full px-2 pt-2 md:hidden">
        <CustomButton variant="ghost" size="icon-sm" className="p-0" asChild>
          <Link href={appRoutes.home}>
            <ArrowLeft className="rtl:rotate-180" />
          </Link>
        </CustomButton>
      </div>
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        <div className="flex w-full max-w-sm flex-col">{children}</div>
      </div>
      <FieldDescription className="text-center text-[10px]">
        By continuing, you agree to the{" "}
        <Link className="text-primary" href="#">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link className="text-primary" href="#">
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </main>
  )
}
