/**
 * @file app/api/store/featured-products/route.ts
 * @description API endpoint to fetch concise featured products for the storefront slider using the getFeaturedProducts action.
 */

import { NextResponse } from "next/server";
import { getFeaturedProducts } from "@/lib/actions/store/queries/get-featured-products";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 10;

    // استخدام دالة جلب المنتجات المتميزة التي قمنا بإنشائها مسبقاً
    const result = await getFeaturedProducts({ limit, activeOnly: true });

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error, 
          details: result.details 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        count: result.data.length, 
        data: result.data 
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unexpected error occurred";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}