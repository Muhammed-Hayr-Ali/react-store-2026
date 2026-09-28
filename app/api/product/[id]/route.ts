import { getProductCompleteById } from "@/lib/actions/products/queries/get-complete-by-id"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  // ✅ التصحيح: انتظار params لضمان التوافق مع Next.js 15 (و 14)
  const params = await Promise.resolve(context.params)
  const id = params.id

  // ✅ حماية إضافية: التأكد من أن الـ ID ليس فارغاً أو كلمة "undefined"
  if (!id || id === "undefined" || id === "null") {
    return NextResponse.json(
      {
        success: false,
        error: "INVALID_ID_PROVIDED",
        details: { message: "معرف المنتج غير صالح أو مفقود" },
      },
      { status: 400 }
    )
  }

  const result = await getProductCompleteById(id)

  if (!result.success) {
    const status = result.error === "PRODUCT_NOT_FOUND" ? 404 : 500
    return NextResponse.json(result, { status })
  }

  return NextResponse.json(result, { status: 200 })
}
