import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/createServerClient";

export async function AuthGuard() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/auth/login");
  }

  return null;
}
