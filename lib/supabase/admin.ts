import { createClient } from "@supabase/supabase-js";

// لا تقم بكتابة المفاتيح مباشرة هنا! سيتم قراءتها من متغيرات البيئة.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// هذا العميل لديه صلاحيات كاملة لتجاوز سياسات RLS
// استخدمه بحذر شديد وفقط في Server Actions الآمنة.
export const createAdminClient = () => {
  // ملاحظة: لا نمرر cookies هنا لأن عميل الخدمة لا يعتمد على جلسة المستخدم
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
