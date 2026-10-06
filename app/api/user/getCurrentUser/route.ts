import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import { NextResponse } from "next/server"


export async function GET() {

  // 1. استدعاء الدالة وحفظ النتيجة في متغير
  const result = await getCurrentUser()

  // 2. إذا فشلت العملية، نعيد النتيجة "كما هي" تماماً
  // ملاحظة: نستخدم 400 (Bad Request) لأن الخطأ بسبب نقص معامل (userId) وليس عطلاً في الخادم
  if (!result) {
    return NextResponse.json(result, { status: 400 })
  }

  // 3. إذا نجحت العملية، نعيد النتيجة "كما هي" تماماً
  return NextResponse.json(result, { status: 200 })
}
