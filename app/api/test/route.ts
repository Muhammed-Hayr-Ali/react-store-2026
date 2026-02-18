import { createServerClient } from "@/lib/supabase/createServerClient";
import { FullProduct } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const slug = searchParams.get("slug");
  const limit = searchParams.get("limit") as number | null;

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      
      name,
      slug,
      short_description,
      main_image_url,
      brand:brands(name),
      category:categories(name),
      variants:product_variants(*),
      reviews(
        *
      ) 
    `,
    ).eq("slug", slug)
    .limit(limit || 4);

  if (error) {
    console.error("Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
