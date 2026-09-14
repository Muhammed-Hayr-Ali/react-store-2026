// lib/actions/authentication/resetPassword.ts
"use server"

import { createAdminClient } from "@/lib/database/supabase/admin"
import { ApiResult } from "@/lib/database/types/utils"
import { sendEmail } from "@/lib/services/email/send-email"
import ResetPasswordEmail from "@/lib/services/email/templates/reset-password-email"
import React from "react"

export async function requestPasswordReset(
  email: string
): Promise<ApiResult<null>> {
  try {
    console.log("🔵 [DEBUG] بدء طلب إعادة تعيين كلمة المرور للإيميل:", email)

    // ✅ التغيير الجذري: استخدام Admin Client من البداية لتجاوز أي قيود RLS على جدول profiles
    const supabaseAdmin = await createAdminClient()

    console.log("🔵 [DEBUG] جاري البحث عن المستخدم في جدول profiles...")
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, first_name, email")
      .eq("email", email)
      .single()

    // التمييز بين "المستخدم غير موجود" و "خطأ حقيقي في قاعدة البيانات"
    if (profileError) {
      if (profileError.code === "PGRST116") {
        console.log("🟡 [DEBUG] الإيميل غير موجود في جدول profiles. إرجاع نجاح وهمي.")
        return { success: true, data: null }
      }
      console.error("🔴 [DEBUG] خطأ حقيقي في قراءة قاعدة البيانات:", profileError)
      throw new Error("DATABASE_READ_ERROR")
    }

    if (!profile) {
      return { success: true, data: null }
    }

    console.log("🟢 [DEBUG] تم العثور على المستخدم. ID:", profile.id)

    // توليد توكين آمن ووقت الانتهاء (15 دقيقة)
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    console.log("🟢 [DEBUG] جاري إدراج التوكين في قاعدة البيانات...")
    
    // إدراج التوكين (نستخدم نفس الـ Admin Client)
    const { error: dbError } = await supabaseAdmin
      .from("password_reset_tokens")
      .insert({
        user_id: profile.id,
        token: token,
        expires_at: expiresAt.toISOString(),
      })

    if (dbError) {
      console.error("🔴 [DEBUG] فشل إدراج التوكين في قاعدة البيانات:", dbError)
      throw new Error("TOKEN_INSERT_FAILED")
    }

    console.log("🟢 [DEBUG] تم إدراج التوكين بنجاح. جاري تجهيز الإيميل...")

    // إنشاء رابط الاستعادة
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://marketna.com"

    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`

    console.log("🟢 [DEBUG] جاري إرسال الإيميل إلى:", email)
    
    await sendEmail({
      to: email,
      subject: "Password Reset Request - Marketna",
      reactComponent: React.createElement(ResetPasswordEmail, {
        firstName: profile.first_name,
        resetUrl: resetUrl,
      }),
    })

    console.log("🟢 [DEBUG] تم إرسال الإيميل بنجاح!")

    return { success: true, data: null }
    
  } catch (error) {
    console.error("🔴 [CRITICAL ERROR] في requestPasswordReset:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "FAILED_TO_SEND_RESET_EMAIL" 
    }
  }
}















// 2. Function to execute the password reset (update the password)
export async function confirmPasswordReset(
  token: string | null,
  newPassword: string
): Promise<ApiResult<null>> {
  try {
    if (!token) {
      return { success: false, error: "MISSING_TOKEN" }
    }

    const supabaseAdmin = createAdminClient()

    // Verify the token via the secure function in the database
    const { data: userId, error: verifyError } = await supabaseAdmin.rpc(
      "verify_and_use_reset_token",
      {
        p_token: token,
      }
    )

    if (verifyError || !userId) {
      return { success: false, error: "INVALID_OR_EXPIRED_TOKEN" }
    }

    // Update the password using the Admin API
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
      })

    if (updateError) {
      console.error("Error updating password:", updateError)
      return { success: false, error: "FAILED_TO_UPDATE_PASSWORD" }
    }

    return { success: true, data: null }
  } catch (error) {
    console.error("Error in confirmPasswordReset:", error)
    return { success: false, error: "UNEXPECTED_ERROR" }
  }
}


