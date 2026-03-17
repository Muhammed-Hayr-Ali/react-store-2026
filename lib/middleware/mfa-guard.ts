import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/createServerClient";
import { appRouter } from "@/lib/config/app_router";

export async function MfaGuard() {

    // Create a new server client
    const supabase = await createServerClient();

    // Get the MFA assurance level
    const { data: aalData, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    // Check for errors
    if (aalError) {
        console.error("AalGuard Error:", aalError);
        return null;
    }

    // Check if MFA is needed
    const needsMfaVerification =
        aalData.currentLevel === "aal1" && aalData.nextLevel === "aal2";

    // Redirect to MFA verification page
    if (needsMfaVerification) {
        return redirect(appRouter.verify);
    }

    return null;
}