import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasRole, ROLES } from "@/lib/actions/role"

export async function GET() {
  const supabase = await createServerClient()
  const diagnosticResults: Record<string, unknown> = {}

  try {
    // 1. فحص المستخدم الحالي
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    diagnosticResults.auth = {
      isAuthenticated: Boolean(user),
      userId: user?.id ?? null,
      email: user?.email ?? null,
      authError: userError ? userError.message : null,
    }

    // 2. فحص صلاحية الأدمن
    let isAdmin = false
    try {
      isAdmin = await hasRole(ROLES.ADMIN)
    } catch (roleErr) {
      diagnosticResults.roleCheckError =
        roleErr instanceof Error ? roleErr.message : String(roleErr)
    }
    diagnosticResults.isAdmin = isAdmin

    // 3. استعلام مباشر بدون أي شروط أو فلاتر أو علاقات خارجية
    const {
      data: directReports,
      count: directCount,
      error: directError,
    } = await supabase
      .from("reports")
      .select("*", { count: "exact" })

    diagnosticResults.directQuery = {
      success: !directError,
      count: directCount,
      rowsReturned: directReports?.length ?? 0,
      sampleData: directReports ?? [],
      errorMessage: directError ? directError.message : null,
      errorCode: directError ? directError.code : null,
      errorDetails: directError ? directError.details : null,
    }

    // 4. فحص استعلام جدول profiles للتأكد من وصول الصلاحيات إليه
    const { count: profilesCount, error: profilesError } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })

    diagnosticResults.profilesQuery = {
      accessible: !profilesError,
      profilesCount,
      errorMessage: profilesError ? profilesError.message : null,
    }

    return NextResponse.json({
      status: "diagnostic_complete",
      data: diagnosticResults,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}