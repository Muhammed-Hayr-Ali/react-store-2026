import { NextResponse } from "next/server";
import { getTotalCartQuantity } from "@/lib/actions/cart"; // تأكد من صحة المسار

/**
 * هذه نقطة نهاية API. عند طلبها عبر GET، فإنها تعيد
 * عناصر السلة كبيانات JSON خام.
 */
export async function GET(request: Request) {
  const count = await getTotalCartQuantity();

  


  // NextResponse.json() تقوم تلقائيًا بتعيين Content-Type: application/json
  return NextResponse.json(count);
}
