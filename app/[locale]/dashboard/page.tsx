import { getUserRole } from "@/lib/actions/user/get_user_role"
import { redirect } from "next/navigation"
import AdminPage from "./admin/page"
import VendorPage from "./vendor/page"
import DeliveryPage from "./delivery/page"
import CustomerPage from "./customer/page"

export default async function Page() {
  const res = await getUserRole()

  if (!res) {
    redirect("/")
  }
  // ;(admin, vendor, delivery, customer)

  if (res.role === "admin") {
    return <AdminPage />
  }

  if (res.role === "vendor") {
    return <VendorPage />
  }

  if (res.role === "delivery") {
    return <DeliveryPage />
  }

  if (res.role === "customer") {
    return <CustomerPage />
  }


  return <></>
}
