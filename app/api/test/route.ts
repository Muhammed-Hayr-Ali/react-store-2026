import { getCart, getTotalCartQuantity } from "@/lib/actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit_count = searchParams.get("limit_count");

  console.log("Received limit_count:", limit_count);

  const { data, error } = await getTotalCartQuantity();

  if (error) {
    return NextResponse.json(
      { data: null, error: "Failed to fetch Data" },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}
