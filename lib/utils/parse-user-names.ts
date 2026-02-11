import { type User } from "@supabase/supabase-js";

/**
 * يحلل الاسم الأول والأخير من كائن المستخدم بذكاء.
 * @param user - كائن المستخدم من Supabase.
 * @returns كائن يحتوي على firstName و lastName.
 */
export function parseUserNames(user: User | null) {
  if (!user) {
    return { firstName: "", lastName: "" };
  }

  const meta = user.user_metadata;

  // الأولوية 1: استخدام الحقول المنفصلة إذا كانت موجودة
  if (meta.first_name || meta.last_name) {
    return {
      firstName: meta.first_name || "",
      lastName: meta.last_name || "",
    };
  }

  // الأولوية 2: تحليل الاسم الكامل إذا كانت الحقول المنفصلة فارغة
  if (meta.name) {
    const nameParts = meta.name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");
    return { firstName, lastName };
  }

  // الأولوية 3: العودة إلى قيم فارغة إذا لم يوجد شيء
  return { firstName: "", lastName: "" };
}
