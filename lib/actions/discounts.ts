// In: lib/actions/discounts.ts

"use server";

import { generateRandomCode } from "./generate-discount-code";
import { createAdminClient } from "../supabase/admin";

// واجهة لخصائص كود الخصم
interface DiscountCodePayload {
  code?: string; // اختياري، إذا لم يتم توفيره سيتم إنشاؤه تلقائيًا
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  expires_at?: string | null; // تاريخ بصيغة ISO
  usage_limit?: number | null;
}

/**
 * Server Action to create a new discount code.
 */
export async function createDiscountCode(payload: DiscountCodePayload) {
  const supabase = await createAdminClient();

  // تحقق من صلاحيات المشرف (مهم جدًا!)
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user || !isUserAdmin(user)) { // isUserAdmin هي دالة يجب أن تنشئها
  //   return { success: false, error: "Unauthorized: You must be an admin." };
  // }

  // توليد كود عشوائي إذا لم يتم توفيره
  const finalCode = payload.code || generateRandomCode(8);

  const { data, error } = await supabase
    .from("discount_codes")
    .insert({
      code: finalCode.toUpperCase(), // دائمًا استخدم الأحرف الكبيرة لسهولة الإدخال
      discount_type: payload.discount_type,
      discount_value: payload.discount_value,
      expires_at: payload.expires_at,
      usage_limit: payload.usage_limit,
      is_active: true, // تفعيله تلقائيًا
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // خطأ تكرار المفتاح الفريد
      return {
        success: false,
        error: `The code "${finalCode}" already exists. Please try a different one.`,
      };
    }
    console.error("Error creating discount code:", error);
    return { success: false, error: "Failed to create discount code." };
  }

  return { success: true, data };
}
