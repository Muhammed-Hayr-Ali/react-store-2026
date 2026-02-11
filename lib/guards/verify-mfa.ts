import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/createServerClient";

export async function VerifyMfaGuard() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const { data, error } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (error) {
    console.error("Error fetching AAL:", error);
    return redirect("/auth/login");
  }

  if (data.currentLevel === "aal2") {
    return redirect("/");
  }

  if (data.nextLevel !== "aal2") {
    return redirect("/");
  }
}
