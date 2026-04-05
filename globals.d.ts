declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "@supabase/ssr" {
  import { SupabaseClient } from "@supabase/supabase-js";

  interface CookieMethods {
    get?(name: string): string | undefined;
    getAll(): Array<{ name: string; value: string }>;
    setAll(
      cookiesToSet: Array<{
        name: string;
        value: string;
        options?: Record<string, any>;
      }>,
    ): void;
  }

  interface CreateClientOptions {
    cookies: CookieMethods;
  }

  export function createServerClient<Database = any>(
    supabaseUrl: string,
    supabaseKey: string,
    options: CreateClientOptions,
  ): SupabaseClient<Database>;

  export function createBrowserClient<Database = any>(
    supabaseUrl: string,
    supabaseKey: string,
    options?: Partial<CreateClientOptions>,
  ): SupabaseClient<Database>;
}
