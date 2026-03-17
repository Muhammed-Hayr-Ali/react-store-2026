import { createBrowserClient as supabaseCreateBrowserClient } from "@supabase/ssr";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createBrowserClient() {
  return supabaseCreateBrowserClient(supabaseUrl!, supabaseAnonKey!,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
}
