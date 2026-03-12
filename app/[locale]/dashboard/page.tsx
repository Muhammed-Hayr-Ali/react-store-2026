// app/[locale]/(account)/profile/page.tsx

import { getUserWithRole } from "@/lib/actions/get-user-action";
import { redirect } from "next/navigation";

export default async function page() {
  // Check if the user is logged in
  const { data: user, error } = await getUserWithRole();

  //if the user is not logged in, redirect to the login page
  if (error || !user) {
    redirect("/auth/login");
  }

  //   Check if the user is an admin
  if (!user.role.includes("admin")) {
  return <>Dashboard Page: {user.role}</>;
  }

//   Return the dashboard page
  return <>Dashboard Page: {user.role}</>;
}
