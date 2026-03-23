import { getUserRole } from "@/lib/actions/user/get_user_role"
import { redirect } from "next/navigation"

export default async function Page() {
  const res = await getUserRole()

  if (!res) {
    redirect("/")
  }
  // ;(admin, vendor, delivery, customer)

  if (res.role === "admin") {
    redirect("/dashboard/admin")
  }

  if (res.role === "vendor") {
    redirect("/dashboard/vendor")
  }

  if (res.role === "delivery") {
    redirect("/dashboard/delivery")
  }

  if (res.role === "customer") {
    redirect("/dashboard/customer")
  }


  return <></>
}
