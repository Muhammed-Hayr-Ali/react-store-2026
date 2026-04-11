import { createClient } from "@/lib/database/supabase/server";
import { getUserRoles } from "../authentication/get-profile";
import { ApiResult } from "@/lib/database/types";

// =====================================================
// 👤 User Role Action
// =====================================================


//  role_id  | role_code | role_description
// ----------+-----------+------------------
//  uuid-1   | admin     | مدير النظام
//  uuid-2   | vendor    | بائع/موظف


export type UserRole = {
  role_id: string;
  role_code: string;
  role_description: string;
};

export async function getUserRole(): Promise<ApiResult<UserRole | null>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "USER_NOT_FOUND",
    };
  };

  const { data: roles, error } = await supabase.rpc("get_user_roles");

  if (error || !roles) {
    return {
      success: false,
      error: "FAILED_TO_FETCH_ROLES",
    };
  }

  // إرجاع الدور الأول (role_code هو اسم الدور)
  return {
    success: true,
    data: roles[0] || null,
  };
}
