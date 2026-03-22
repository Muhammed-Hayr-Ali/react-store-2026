# نظام ربط البروفايل بالخطط (Profile Plans Links)

## 📋 نظرة عامة

جدول ربط المستخدمين بالخطط في منصة Marketna للتجارة الإلكترونية.

**الإصدار:** 1.0
**التاريخ:** 2026-03-21
**الاعتماديات:** `public.profiles`, `public.plans`

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

### `public.profile_plans`

| العمود           | النوع       | الوصف                          |
| ---------------- | ----------- | ------------------------------ |
| `id`             | UUID        | المعرف الفريد للسجل            |
| `user_id`        | UUID        | معرف المستخدم (من profiles.id) |
| `plan_id`        | UUID        | معرف الخطة (من plans.id)       |
| `status`         | TEXT        | حالة الخطة                     |
| `start_date`     | TIMESTAMPTZ | تاريخ بدء الخطة                |
| `end_date`       | TIMESTAMPTZ | تاريخ انتهاء الخطة             |
| `trial_end_date` | TIMESTAMPTZ | تاريخ انتهاء الفترة التجريبية  |
| `created_at`     | TIMESTAMPTZ | تاريخ إنشاء السجل              |
| `updated_at`     | TIMESTAMPTZ | تاريخ آخر تحديث للسجل          |

---

## 🔧 حالات الخطة

| الحالة      | الوصف        |
| ----------- | ------------ |
| `active`    | خطة نشطة     |
| `expired`   | خطة منتهية   |
| `cancelled` | خطة ملغاة    |
| `pending`   | خطة معلقة    |
| `trial`     | فترة تجريبية |

---

## 🔧 الفهارس

| الفهرس                            | الوصف                          |
| --------------------------------- | ------------------------------ |
| `idx_profile_plans_active_unique` | ضمان خطة نشطة واحدة لكل مستخدم |
| `idx_profile_plans_user`          | بحث سريع بمعرف المستخدم        |
| `idx_profile_plans_plan`          | بحث سريع بمعرف الخطة           |
| `idx_profile_plans_status`        | تصفية الخطط حسب الحالة         |

---

## 🔒 سياسات الأمان

- ✅ المستخدم يقرأ خطته فقط
- ✅ المستخدم يدير خطته فقط

---

## 📝 طريقة الاستخدام

```sql
-- إنشاء خطة جديدة
INSERT INTO public.profile_plans (user_id, plan_id, status, end_date)
VALUES ('user-uuid', 'plan-uuid', 'active', NOW() + INTERVAL '1 year');

-- قراءة خطط مستخدم
SELECT * FROM public.profile_plans
WHERE user_id = auth.uid() AND status = 'active';
```

---

## ✅ نهاية الملف
