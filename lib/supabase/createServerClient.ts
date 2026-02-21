// lib/supabase/createServerClient.ts
import { createServerClient as supabaseCreateServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerClient() {
  // ملاحظة هامة: يجب استدعاء cookies() داخل الدالة، وليس في أعلى الملف
  const cookieStore = await cookies();

  return supabaseCreateServerClient(
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
              cookieStore.set(name, value, options),
            );
          } catch {
            // يتم تجاهل الخطأ إذا تم الاستدعاء من مكون خادم لا يدعم الكتابة المباشرة
            // حيث سيقوم Middleware بتحديث الجلسة
          }
        },
      },
    },
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
