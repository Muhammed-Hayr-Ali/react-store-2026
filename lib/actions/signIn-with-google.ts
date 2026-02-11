import { createBrowserClient } from "@/lib/supabase/createBrowserClient";

export async function signInWithGoogle(locale: string) {
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/${locale}/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Supabase Google Sign-In Error:", error.message);
    throw error;
  }
}
