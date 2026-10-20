import { createClient } from "@/lib/database/supabase/server"
import { NextResponse } from "next/server"

// 1. GET: لجلب جميع التقييمات مع بيانات العميل والمنتج المرتبط
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("product_reviews")
      .select(
        `
        id,
        rating,
        content,
        is_approved,
        created_at,
        profiles:user_id (
          id,
          first_name,
          last_name,
          email,
          profile_image
        ),
        products:product_id (
          id,
          name,
          slug
        )
      `
      )
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: true, count: data.length, data },
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

// 2. POST: لإضافة تقييم تجريبي جديد
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { product_id, user_id, rating, content, is_approved } = body

    // التحقق من الحقول الأساسية
    if (!product_id || !rating || !content) {
      return NextResponse.json(
        {
          success: false,
          error: "الحقول التالية مطلوبة: product_id, rating (1-5), content",
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("product_reviews")
      .insert([
        {
          product_id,
          user_id: user_id || null, // يمكن أن يكون فارغاً إذا كان التقييم لمستخدم غير مسجل
          rating: Number(rating),
          content,
          is_approved: is_approved ?? false, // افتراضياً قيد الانتظار للمراجعة
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: true, message: "تم إضافة التقييم بنجاح", data },
      { status: 201 }
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
