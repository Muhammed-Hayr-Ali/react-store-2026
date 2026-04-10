# 🧪 اختبارات قاعدة البيانات

> اختبارات شاملة للتحقق من سلامة قاعدة البيانات وسياسات الأمان.

---

## ⚠️ تحذير مهم

🔴 **لا تشغّل هذه الاختبارات في بيئة الإنتاج!**

هذه الاختبارات مصممة لبيئة التطوير فقط وقد تقوم بعمليات غير مرغوبة.

---

## 📂 الهيكل

```
supabase/006_Tests/
├── 001_test_rls_policies.sql    ← اختبارات سياسات الأمان
└── README.md                    ← هذا الملف
```

---

## 🚀 التشغيل

### عبر Supabase Dashboard
1. افتح **SQL Editor**
2. الصق محتوى `001_test_rls_policies.sql`
3. اضغط **Run**
4. راجع النتائج في Console

### عبر psql
```bash
psql -h <host> -U postgres -d postgres \
  -f "006_Tests/001_test_rls_policies.sql"
```

### عبر Supabase CLI
```bash
supabase db reset  # يعيد تشغيل جميع الملفات
```

---

## 📋 الاختبارات المشمولة

| الاختبار | الوصف |
|----------|-------|
| **RLS تفعيل** | التحقق من تفعيل RLS على جميع الجداول |
| **الدوال المساعدة** | اختبار current_user_id(), is_admin() |
| **السياسات** | عدّ وعرض السياسات لكل جدول |
| **الوصول العام** | التحقق من البيانات المرئية للعامة |
| **المفاتيح الخارجية** | التحقق من عدم وجود أيتام |
| **الفهارس** | عدّ وعرض الفهارس لكل جدول |
| **المشغلات** | التحقق من المشغلات المسجلة |
| **الدوال** | عرض جميع الدوال المتاحة |

---

## 📊 الإخراج المتوقع

```
========================================
📊 ملخص قاعدة البيانات:
========================================
📋 جداول: 20
🔒 سياسات RLS: 65
📑 فهارس: 61
⚡ مشغلات: 18
🔧 دوال: 23
========================================
✅ اكتملت الاختبارات الأساسية
========================================
```

---

## 🔍 التحقق اليدوي

### التحقق من RLS
```sql
SELECT relname, relrowsecurity
FROM pg_class 
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
ORDER BY relname;
```

### التحقق من السياسات
```sql
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

### التحقق من الدوال الأمنية
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'current_user_id', 'is_admin', 'is_vendor', 
    'is_delivery', 'has_permission', 'has_role'
  )
ORDER BY routine_name;
```

---

## 🐛 استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| خطأ "function does not exist" | تأكد من تشغيل 002_Utility Functions أولاً |
| "policy not found" | تأكد من تشغيل 003_RLS Policies أولاً |
| جداول بدون RLS | تحقق من `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` |
| أخطاء مفاتيح خارجية | راجع جدول `system_error_log` |

---

## ✅ ترتيب التشغيل

```
1. ✅ 001_Schema/001_schema.sql
2. ✅ 002_Utility Functions/000_utility_functions.sql
3. ✅ 003_RLS Policies/000_rls_policies.sql
4. ✅ 004_Seed Data/001_role_seed.sql
5. ✅ 005_Trigger Functions/000_trigger_functions.sql
6. ✅ 006_Tests/001_test_rls_policies.sql    ← هذا الملف
```
