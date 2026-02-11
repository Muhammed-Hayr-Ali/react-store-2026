import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/createServerClient";

export async function GuestGuard() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    return redirect("/");
  }

  return null;
}
