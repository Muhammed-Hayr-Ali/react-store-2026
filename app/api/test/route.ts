import { NextResponse } from "next/server";
import { getTotalCartQuantity } from "@/lib/actions/cart"; // تأكد من صحة المسار
import { getWishlistItems } from "@/lib/actions";

/**
 * هذه نقطة نهاية API. عند طلبها عبر GET، فإنها تعيد
 * عناصر السلة كبيانات JSON خام.
 */
export async function GET() {


  const count = await getWishlistItems();

  


  // NextResponse.json() تقوم تلقائيًا بتعيين Content-Type: application/json
  return NextResponse.json(count);
}
