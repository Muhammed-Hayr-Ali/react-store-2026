





"use server";

import { notFound } from "next/navigation";
import { getCurrentUserRoles } from "../actions/user_roles";

export async function RolesGuard({ roleNames  }: { roleNames: string }) {

  
  const data = await getCurrentUserRoles();


  if (data?.some((role) => roleNames.includes(role))) {
    console.log("User has the required role");
    return null;
  }
  console.log("User does not have the required role");
  return notFound();
}
