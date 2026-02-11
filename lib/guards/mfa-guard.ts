import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/createServerClient";

export async function MfaGuard() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: aalData, error } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (error) {
    console.error("AalGuard Error:", error);
    return null;
  }

  const needsMfaVerification =
    aalData.currentLevel === "aal1" && aalData.nextLevel === "aal2";

  if (needsMfaVerification) {
    return redirect("/verify");
  }

  return null;
}
