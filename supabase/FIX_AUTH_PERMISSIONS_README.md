# إصلاح خطأ صلاحيات auth.users

## المشكلة
```
ERROR: 42501: must be owner of relation users
```

هذا الخطأ يحدث لأن جدول `auth.users` هو جدول نظام مملوك لـ Supabase ولا يمكن تعديله مباشرة.

## الحل

### الطريقة 1: عبر Supabase Dashboard (موصى بها)

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **SQL Editor**
4. انسخ والصق محتوى ملف `99_fix_auth_permissions.sql`
5. اضغط **Run**

### الطريقة 2: عبر psql Command Line

```bash
# اتصل بقاعدة البيانات باستخدام postgres user
psql -h db.<project-ref>.supabase.co -U postgres -d postgres -f supabase/99_fix_auth_permissions.sql
```

### الطريقة 3: عبر Supabase CLI

```bash
# قم بتسجيل الدخول
npx supabase login

# اربط المشروع
npx supabase link --project-ref <your-project-ref>

# نفّذ الملف
npx supabase db execute --file supabase/99_fix_auth_permissions.sql
```

## ما يفعله الملف

1. **ينظف** الـ triggers والfunctions القديمة
2. **يمنح صلاحيات EXECUTE** للدوال `handle_new_user` و `handle_user_login`
3. **يمنح صلاحيات** على schema العام لـ `supabase_auth_admin`
4. **يعيد إنشاء الدوال** مع الإصلاحات الضرورية
5. **يعيد إنشاء الـ Triggers** على جدول `auth.users` بصلاحيات صحيحة
6. **يتحقق** من أن كل شيء يعمل بشكل صحيح

## النتيجة

بعد تنفيذ الملف، عند تسجيل مستخدم جديد:

✅ يتم إنشاء ملفه في `public.profiles` تلقائيًا
✅ يتم منحه دور `customer` في `public.profile_roles`
✅ يتم منحه خطة `Free Member` في `public.profile_plans`

## ملفات ذات صلة

| الملف | الوصف |
|------|-------|
| `02_profiles/3_create_function.sql` | دوال إنشاء الملفات (Version 4.2) |
| `03_roles/1_create_table.sql` + `4_create_data.sql` | بيانات الأدوار (بما فيها customer) |
| `04_profile_roles_links/1_create_table.sql` | جدول ربط الملفات بالأدوار |
| `05_subscription_plans/1_create_table.sql` + `4_create_data.sql` | بيانات الخطط (بما فيها Free Member) |
| `06_profile_plans/1_create_table.sql` | جدول ربط الملفات بالخطط |
| `99_fix_auth_permissions.sql` | ملف الإصلاح النهائي |

## ترتيب التنفيذ الصحيح

```
1. 02_profiles/1_create_table.sql
2. 03_roles/1_create_table.sql
3. 03_roles/4_create_data.sql
4. 04_profile_roles_links/1_create_table.sql
5. 05_subscription_plans/1_create_table.sql
6. 05_subscription_plans/4_create_data.sql
7. 06_profile_plans/1_create_table.sql
8. 02_profiles/3_create_function.sql
9. 99_fix_auth_permissions.sql  ← ملف الإصلاح (الأهم!)
```

## ملاحظات مهمة

⚠️ **يجب تنفيذ ملف `99_fix_auth_permissions.sql` بواسطة postgres user فقط**

⚠️ **تأكد من وجود البيانات التالية قبل التنفيذ:**
- دور `customer` في جدول `roles`
- خطة `Free Member` مع `is_default = true` في جدول `plans`

## التحقق من النجاح

بعد التنفيذ، جرب إنشاء مستخدم جديد وتحقق من:

```sql
-- 1. التحقق من الملف الشخصي
SELECT * FROM public.profiles WHERE email = 'user@example.com';

-- 2. التحقق من الدور
SELECT 
  p.email, 
  r.name as role_name,
  pr.is_active,
  pr.granted_at
FROM public.profiles p
JOIN public.profile_roles pr ON p.id = pr.user_id
JOIN public.roles r ON pr.role_id = r.id
WHERE p.email = 'user@example.com';

-- 3. التحقق من الخطة
SELECT 
  p.email, 
  pl.name as plan_name, 
  pl.category,
  pp.status,
  pp.start_date
FROM public.profiles p
JOIN public.profile_plans pp ON p.id = pp.user_id
JOIN public.plans pl ON pp.plan_id = pl.id
WHERE p.email = 'user@example.com';

-- 4. التحقق من الـ triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_login');

-- 5. التحقق من الدوال
SELECT 
  routine_name,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'handle_user_login');
```

## استكشاف الأخطاء

### المشكلة: الدور 'customer' غير موجود
```sql
-- تحقق من الأدوار المتاحة
SELECT name FROM public.roles;

-- إذا لم يكن موجودًا، نفّذ ملف البيانات
-- 03_roles/4_create_data.sql
```

### المشكلة: الخطة 'Free Member' غير موجودة
```sql
-- تحقق من الخطط المتاحة
SELECT category, name, is_default FROM public.plans WHERE category = 'customer';

-- إذا لم تكن موجودة، نفّذ ملف البيانات
-- 05_subscription_plans/4_create_data.sql
```

### المشكلة: الخطأ لا يزال يظهر
```sql
-- تحقق من مالك الدالة
SELECT 
  routine_name,
  routine_schema,
  security_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- أعد تنفيذ ملف 99_fix_auth_permissions.sql عبر postgres user
```
