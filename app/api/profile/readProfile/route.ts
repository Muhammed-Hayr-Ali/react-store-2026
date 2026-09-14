import readProfile from "@/lib/actions/profile/read-profile"
import { NextRequest, NextResponse } from "next/server"


// http://localhost:3000/api/profile/readProfile?userId=00000000-0000-0000-0000-000000000000

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")

  // 1. استدعاء الدالة وحفظ النتيجة في متغير
  const result = await readProfile({ userId })

  // 2. إذا فشلت العملية، نعيد النتيجة "كما هي" تماماً
  // ملاحظة: نستخدم 400 (Bad Request) لأن الخطأ بسبب نقص معامل (userId) وليس عطلاً في الخادم
  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  // 3. إذا نجحت العملية، نعيد النتيجة "كما هي" تماماً
  return NextResponse.json(result, { status: 200 })
}
