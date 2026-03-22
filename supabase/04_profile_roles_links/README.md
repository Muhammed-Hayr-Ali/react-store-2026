# نظام ربط البروفايل مع الأدوار (Profile Roles Links)

## 📋 نظرة عامة

جدول ربط المستخدمين بالأدوار في منصة Marketna للتجارة الإلكترونية.

**الإصدار:** 1.0  
**التاريخ:** 2026-03-21  
**الاعتماديات:** `public.profiles`, `public.roles`

---

## 📁 محتويات المجلد

| الملف                 | الوصف                         |
| --------------------- | ----------------------------- |
| `create_table.sql`    | إنشاء جدول الربط والفهارس     |
| `create_function.sql` | الدوال (لا يوجد)              |
| `create_policy.sql`   | سياسات الأمان (RLS)           |
| `create_data.sql`     | البيانات الافتراضية (لا يوجد) |

---

## 📊 بنية الجدول

### `public.profile_roles`

| العمود       | النوع       | الوصف                          |
| ------------ | ----------- | ------------------------------ |
| `user_id`    | UUID        | معرف المستخدم (من profiles.id) |
| `role_id`    | UUID        | معرف الدور (من roles.id)       |
| `is_active`  | BOOLEAN     | هل الدور نشط حالياً            |
| `granted_at` | TIMESTAMPTZ | تاريخ منح الدور                |
| `granted_by` | UUID        | من قام بمنح الدور              |

**المفتاح الأساسي:** `(user_id, role_id)`

---

## 🔧 الفهارس

| الفهرس                     | الوصف                   |
| -------------------------- | ----------------------- |
| `idx_profile_roles_user`   | بحث سريع بمعرف المستخدم |
| `idx_profile_roles_role`   | بحث سريع بمعرف الدور    |
| `idx_profile_roles_active` | تصفية الأدوار النشطة    |

---

## 🔒 سياسات الأمان

- ✅ المستخدم يقرأ أدواره النشطة فقط
- ✅ المدراء يقرأون جميع الأدوار
- ✅ فقط المدراء يمكنهم إدارة الأدوار

---

## 📝 طريقة الاستخدام

```sql
-- منح دور لمستخدم
INSERT INTO public.profile_roles (user_id, role_id, is_active)
VALUES ('user-uuid', 'role-uuid', true);

-- قراءة أدوار مستخدم
SELECT r.name, r.description
FROM public.profile_roles pr
JOIN public.roles r ON r.id = pr.role_id
WHERE pr.user_id = auth.uid() AND pr.is_active = true;
```

---

## ✅ نهاية الملف
