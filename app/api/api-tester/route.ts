import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/createServerClient"

/**
 * API Tester Endpoint - لاختبار دوال بيانات المستخدم الآمنة
 * 
 * Methods: GET
 * 
 * Query Parameters:
 * - function: اسم الدالة المطلوب اختبارها
 *   - get_my_complete_data
 *   - get_my_permissions
 *   - do_i_have_permission
 *   - get_my_setup_status
 *   - get_user_complete_data_admin
 * - permission: الصلاحية للتحقق منها (مطلوب فقط لـ do_i_have_permission)
 * - target_user_id: معرف المستخدم المستهدف (مطلوب فقط لـ get_user_complete_data_admin)
 * 
 * @example GET /api/api-tester?function=get_my_complete_data
 * @example GET /api/api-tester?function=do_i_have_permission&permission=products:create
 * @example GET /api/api-tester?function=get_user_complete_data_admin&target_user_id=uuid
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const functionName = searchParams.get("function")
    const permission = searchParams.get("permission")
    const targetUserId = searchParams.get("target_user_id")

    // التحقق من وجود اسم الدالة
    if (!functionName) {
      return NextResponse.json(
        {
          success: false,
          error: "MISSING_FUNCTION",
          message: "يجب تحديد اسم الدالة باستخدام معامل 'function'",
          availableFunctions: [
            "get_my_complete_data",
            "get_my_permissions",
            "do_i_have_permission",
            "get_my_setup_status",
            "get_user_complete_data_admin",
          ],
        },
        { status: 400 },
      )
    }

    // إنشاء عميل Supabase للخادم
    const supabase = await createServerClient()

    // التحقق من أن المستخدم مسجل دخول
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "NOT_AUTHENTICATED",
          message: "يجب تسجيل الدخول لاستخدام هذه الواجهة",
        },
        { status: 401 },
      )
    }

    let result: unknown

    // استدعاء الدالة المطلوبة
    switch (functionName) {
      case "get_my_complete_data":
        result = await supabase.rpc("get_my_complete_data")
        break

      case "get_my_permissions":
        result = await supabase.rpc("get_my_permissions")
        break

      case "do_i_have_permission":
        if (!permission) {
          return NextResponse.json(
            {
              success: false,
              error: "MISSING_PERMISSION",
              message: "يجب تحديد الصلاحية باستخدام معامل 'permission'",
            },
            { status: 400 },
          )
        }
        result = await supabase.rpc("do_i_have_permission", {
          p_permission: permission,
        })
        break

      case "get_my_setup_status":
        result = await supabase.rpc("get_my_setup_status")
        break

      case "get_user_complete_data_admin":
        if (!targetUserId) {
          return NextResponse.json(
            {
              success: false,
              error: "MISSING_TARGET_USER_ID",
              message: "يجب تحديد معرف المستخدم باستخدام معامل 'target_user_id'",
            },
            { status: 400 },
          )
        }
        result = await supabase.rpc("get_user_complete_data_admin", {
          p_target_user_id: targetUserId,
        })
        break

      default:
        return NextResponse.json(
          {
            success: false,
            error: "INVALID_FUNCTION",
            message: `اسم الدالة '${functionName}' غير صحيح`,
            availableFunctions: [
              "get_my_complete_data",
              "get_my_permissions",
              "do_i_have_permission",
              "get_my_setup_status",
              "get_user_complete_data_admin",
            ],
          },
          { status: 400 },
        )
    }

    const { data, error } = result as { data: unknown; error: unknown }

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "FUNCTION_ERROR",
          message: "حدث خطأ أثناء تنفيذ الدالة",
          details: error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        function: functionName,
        data: data,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("API Tester Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "حدث خطأ داخلي في الخادم",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

/**
 * وثيقة الواجهة البرمجية
 */
export const ApiDocumentation = {
  endpoint: "/api/api-tester",
  method: "GET",
  authentication: "required",
  description: "واجهة لاختبار دوال بيانات المستخدم الآمنة في Supabase",

  parameters: {
    function: {
      required: true,
      type: "string",
      description: "اسم الدالة المطلوب اختبارها",
      values: [
        "get_my_complete_data",
        "get_my_permissions",
        "do_i_have_permission",
        "get_my_setup_status",
        "get_user_complete_data_admin",
      ],
    },
    permission: {
      required: false,
      type: "string",
      description: "الصلاحية للتحقق منها (مطلوب فقط لـ do_i_have_permission)",
    },
    target_user_id: {
      required: false,
      type: "string",
      description: "معرف المستخدم المستهدف (مطلوب فقط لـ get_user_complete_data_admin)",
    },
  },

  examples: {
    get_my_complete_data: "/api/api-tester?function=get_my_complete_data",
    get_my_permissions: "/api/api-tester?function=get_my_permissions",
    do_i_have_permission: "/api/api-tester?function=do_i_have_permission&permission=products:create",
    get_my_setup_status: "/api/api-tester?function=get_my_setup_status",
    get_user_complete_data_admin: "/api/api-tester?function=get_user_complete_data_admin&target_user_id=xxx-xxx-xxx",
  },

  responseFormat: {
    success: "boolean",
    function: "string",
    data: "any",
    timestamp: "string (ISO 8601)",
  },
}
