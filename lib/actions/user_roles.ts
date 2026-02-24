"use server"; // هذا التوجيه ضروري إذا كنت ستستدعي هذه الدالة من مكونات العميل.

import { createServerClient } from "@/lib/supabase/createServerClient"; // تأكد من صحة المسار
import { unstable_noStore as noStore } from "next/cache";

interface UserRoles {
  name: string;
}
export async function getCurrentUserRoles(): Promise<string[]> {
  noStore();

  const supabase = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("AUTHENTICATION_FAILED");
    return [];
  }

  const { data, error } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id);

  if (error || !data) {
    console.error("Error fetching user roles:", error.message);
    return [];
  }

  const roles: UserRoles[] = data.map((item) => item.roles).flat();
  const roleNames = roles.map((role) => role.name);

  return roleNames;
}
