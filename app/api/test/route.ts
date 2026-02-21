import { checkWishlistStatus } from "@/lib/actions/wishlist";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit_count = searchParams.get("limit_count");

  console.log("Received limit_count:", limit_count);

  const { data, error } = await checkWishlistStatus([
    "54156e72-89ba-4225-9cc9-e1212473a798",
    "2",
    "3",
  ]);

  if (error) {
    return NextResponse.json(
      { data: null, error: "Failed to fetch Data" },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}
