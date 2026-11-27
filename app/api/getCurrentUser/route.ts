import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import { createServerClient } from "@/lib/database/supabase/server"
import { NextResponse } from "next/server"

// 1. GET: لجلب جميع التقييمات مع بيانات العميل والمنتج المرتبط
export async function GET() {
  try {
   const supabase = await createServerClient()

      const { data: result, error } = await supabase.rpc("get_current_user")

    if (!result || error) {
      return NextResponse.json(
        { success: false, error: result },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    )
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unexpected error occurred"
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}



















