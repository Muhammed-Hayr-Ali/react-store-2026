import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database/types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // في Server Actions
          }
        },
      },
    }
  );
}

// import { createServerClient as supabaseCreateServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// export async function createServerClient() {
//   const cookieStore = await cookies();

//   return supabaseCreateServerClient(supabaseUrl!, supabaseAnonKey!, {
//     cookies: {
//       getAll() {
//         return cookieStore.getAll();
//       },
//       setAll(cookiesToSet) {
//         try {
//           cookiesToSet.forEach(({ name, value }) =>
//             cookieStore.set(name, value),
//           );
//         } catch {
//           // The `setAll` method was called from a Server Component.
//           // This can be ignored if you have middleware refreshing
//           // user sessions.
//         }
//       },
//     },
//   });
// }
