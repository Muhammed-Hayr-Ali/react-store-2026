# 🗄️ Supabase Database — Single-Merchant E-Commerce

> **قاعدة بيانات شاملة لمنصة تجارة إلكترونية (تاجر واحد) مع نظام توصيل ورمز QR**
>
> PostgreSQL 14+ | UTF-8 | Row Level Security | Production Ready

---

## 📂 هيكل المجلدات

> ✅ **المجلدات مرقّمة حسب ترتيب التنفيذ** — الأرقام تتطابق مع الخطوات.

```
supabase/
├── 000_Cleanup/                     ← (اختياري) حذف كل شيء للبدء من جديد
│   └── drop_all_tables.sql
│
├── 001_Schema/                      ← الخطوة 1: الجداول والعلاقات
│   ├── README.md
│   ├── 000_dbml.dbml
│   └── 001_schema.sql
│
├── 002_Utility Functions/           ← الخطوة 2: الدوال المساعدة
│   ├── README.md
│   └── 000_utility_functions.sql
│
├── 003_RLS Policies/                ← الخطوة 3: سياسات الأمان
│   ├── README.md
│   └── 000_rls_policies.sql
│
├── 004_Seed Data/                   ← الخطوة 4: البيانات الأولية
│   ├── 001_role_seed.sql            ← بيانات الأدوار
│   └── 002_store_seed.sql           ← إعدادات المتجر وأسعار الصرف
│
├── 005_Trigger Functions/           ← الخطوة 5: المشغلات الآلية
│   ├── 000_trigger_functions.sql
│   └── 002_create_test_user.sql
│
├── 006_Tests/                       ← الخطوة 6: الاختبارات
│   └── 001_test_rls_policies.sql
│
├── 007_Password Reset/              ← نظام استعادة كلمة السر
├── 008_Notifications/               ← نظام الإشعارات
├── 009_Storage/                     ← إعدادات التخزين
│
└── README.md                        ← 📖 هذا الملف
```

---

## 🚀 دليل البدء السريع

### الخطوة 1: إنشاء الجداول

```sql
-- 001_Schema/001_schema.sql
-- يُنشئ 20 جدول + 9 ENUMs + 60+ فهرس + 30+ مفتاح خارجي
```

### الخطوة 2: إنشاء الدوال المساعدة

```sql
-- 002_Utility Functions/000_utility_functions.sql
-- 14 دالة للتحقق من الصلاحيات، الأدوار، والتوصيل عبر QR
```

### الخطوة 3: تفعيل سياسات الأمان

```sql
-- 003_RLS Policies/000_rls_policies.sql
-- 65+ سياسة RLS لحماية البيانات
```

### الخطوة 4: إدخال بيانات الأدوار

```sql
-- 004_Seed Data/001_role_seed.sql
-- 5 أدوار نظام (admin, vendor, customer, delivery, support)
```

### الخطوة 4.5: إعداد المتجر وأسعار الصرف

```sql
-- 004_Seed Data/002_store_seed.sql
-- إعدادات المتجر الافتراضية + 8 عملات
```

### الخطوة 5: إعداد المشغلات الآلية

```sql
-- 005_Trigger Functions/000_trigger_functions.sql
-- مزامنة البروفايل + تحديث الطوابع الزمنية
```

### الخطوة 6: تشغيل الاختبارات (تطوير فقط!)

```sql
-- 006_Tests/001_test_rls_policies.sql
-- التحقق من صحة سياسات الأمان
```

---

## 📊 إحصائيات قاعدة البيانات

| العنصر                | العدد |
| --------------------- | :---: |
| **جداول**             |  20   |
| **ENUMs**             |   9   |
| **فهارس**             |  60+  |
| **مفاتيح خارجية**     |  29   |
| **سياسات RLS**        |  65+  |
| **دوال (Functions)**  |  23+  |
| **مشغلات (Triggers)** |  18   |

---

## 🏗️ الوحدات (Modules)

| #   | الوحدة         | الجداول | الوصف                                 |
| --- | -------------- | :-----: | ------------------------------------- |
| 1️⃣  | CORE           |    5    | المستخدمين، الأدوار، العناوين         |
| 2️⃣  | STORE          |    5    | إعدادات المتجر، الفئات، المنتجات      |
| 3️⃣  | EXCHANGE RATES |    1    | أسعار صرف العملات                     |
| 4️⃣  | TRADE          |    3    | الطلبات، التسليم عبر QR Code، العناصر |
| 5️⃣  | SOCIAL         |    2    | التقييمات والمفضلة                    |
| 6️⃣  | SUPPORT        |    2    | تذاكر الدعم                           |
| 7️⃣  | SYSTEM         |    2    | الإشعارات وسجل الأخطاء                |

---

## 🔐 الأمان

### سياسات RLS:

- ✅ جميع الجداول الـ 20 محمية بـ Row Level Security
- ✅ **PUBLIC** يمكنه فقط رؤية البيانات العامة (منتجات نشطة، تقييمات)
- ✅ **authenticated** يدير بياناته فقط
- ✅ **admin** يتجاوز جميع القيود
- ✅ **vendor** يدير المنتجات والطلبات
- ✅ **delivery** يحدث حالة التسليم عبر QR فقط
- ✅ صلاحيات الأعمدة (Column-Level) على `core_profile`

### الدوال الأمنية:

| الدالة               | الوصف                             |
| -------------------- | --------------------------------- |
| `current_user_id()`  | معرف المستخدم من جلسة المصادقة    |
| `is_admin()`         | التحقق من صفة المدير              |
| `is_vendor()`        | التحقق من صفة الموظف/البائع       |
| `is_delivery()`      | التحقق من صفة سائق التوصيل        |
| `has_permission()`   | التحقق من صلاحية معينة            |
| `is_product_owner()` | التحقق من ملكية المنتج (user_id)  |
| `verify_delivery()`  | التحقق من تسليم الطلب عبر QR Code |

---

## 📖 التوثيق

كل مجلد يحتوي على ملف `README.md` خاص به مع توثيق شامل:

| المجلد                   | الخطوة | التوثيق                                          |
| ------------------------ | :----: | ------------------------------------------------ |
| `001_Schema/`            |   1    | [📖 README](./001_Schema/README.md)              |
| `002_Utility Functions/` |   2    | [📖 README](./002_Utility%20Functions/README.md) |
| `003_RLS Policies/`      |   3    | [📖 README](./003_RLS%20Policies/README.md)      |
| `005_Trigger Functions/` |   5    | [📖 README](./005_Trigger%20Functions/README.md) |

---

## 🛠️ أدوات مفيدة

### عرض المخطط البصري (ERD):

1. افتح [dbdiagram.io](https://dbdiagram.io)
2. الصق محتوى `001_Schema/000_dbml.dbml`
3. سيظهر مخطط تفاعلي لجميع الجداول

### عبر Supabase CLI:

```bash
# إنشاء مشروع محلي
supabase init

# تشغيل جميع الملفات
supabase db reset

# دفع التغييرات
supabase db push
```

### عبر psql (ترتيب التنفيذ):

```bash
psql -h <host> -U postgres -d postgres \
  -f "001_Schema/001_schema.sql" \
  -f "002_Utility Functions/000_utility_functions.sql" \
  -f "003_RLS Policies/000_rls_policies.sql" \
  -f "004_Seed Data/001_role_seed.sql" \
  -f "004_Seed Data/002_store_seed.sql" \
  -f "005_Trigger Functions/000_trigger_functions.sql"
```

---

## 📝 ملاحظات مهمة

- ✅ **ترتيب الملفات مهم:** كل ملف يعتمد على الملفات السابقة
- ✅ **آمن للتشغيل المتكرر:** دوال التحقق من الملكية تستخدم `user_id`
- 🔴 **لا تشغّل ملفات الاختبار في الإنتاج:** `006_Tests/`
- ✅ **مراجعة أمان:** تم تحديث جميع السياسات لتعكس `user_id` بدلاً من `vendor_id`
- ✅ **نظام QR:** جداول `trade_order_delivery` مخصصة للتحقق من التسليم

---

## 🆘 الدعم

إذا واجهت مشكلة:

1. تحقق من ترتيب تنفيذ الملفات
2. شغّل `006_Tests/001_test_rls_policies.sql` للتحقق من صحة الإعداد
3. راجع `system_error_log` للأخطاء المسجلة
4. تحقق من تفعيل RLS على جميع الجداول:
   ```sql
   SELECT relname, relrowsecurity
   FROM pg_class WHERE relnamespace = 'public'::regnamespace
     AND relkind = 'r'
   ORDER BY relname;
   ```

---

## 📄 الترخيص

هذا المشروع خاص — جميع الحقوق محفوظة.
