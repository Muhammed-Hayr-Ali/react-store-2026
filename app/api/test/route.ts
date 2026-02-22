import { getReviewsByProductId } from "@/lib/actions/reviews";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit_count = searchParams.get("limit_count");

  console.log("Received limit_count:", limit_count);

  const { data: initialCartCount, error } = await getReviewsByProductId(
    "c124741e-d725-40fd-b08c-448b6ff3a55a",
  );

  if (error) {
    return NextResponse.json(
      { data: null, error: "Failed to fetch Data" },
      { status: 500 },
    );
  }

  return NextResponse.json(initialCartCount);
}
