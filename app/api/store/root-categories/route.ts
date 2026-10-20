/**
 * @file app/api/store/root-categories/route.ts
 * @description API endpoint to fetch active root categories for testing.
 */

import { NextResponse } from "next/server";
import { getRootCategories } from "@/lib/actions/store/queries/get-root-categories";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 10;

    // استدعاء الدالة التي تم إنشاؤها مسبقاً
    const result = await getRootCategories({ limit });

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