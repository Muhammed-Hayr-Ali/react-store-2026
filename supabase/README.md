# 🗄️ Supabase Database — Multi-Vendor E-Commerce

> **قاعدة بيانات شاملة لمنصة تجارة إلكترونية متعددة البائعين مع نظام SaaS**
>
> PostgreSQL 14+ | UTF-8 | Row Level Security | Production Ready

---

## 📂 هيكل المجلدات

> ✅ **المجلدات مرقّمة حسب ترتيب التنفيذ** — الأرقام تتطابق مع الخطوات.

```
supabase/
├── 001_Schema/                    ← الخطوة 1: الجداول والعلاقات
│   ├── README.md
│   ├── 000_dbml.dbml
│   └── 001_schema.sql
│
├── 002_Utility Functions/         ← الخطوة 2: الدوال المساعدة
│   ├── README.md
│   └── 000_utility_functions.sql
│
├── 003_RLS Policies/              ← الخطوة 3: سياسات الأمان
│   └── 002_rls_policies.sql
│
├── 004_Seed Data/                 ← الخطوة 4-5: البيانات الأولية
│   ├── README.md
│   ├── 001_role_seed.sql
│   ├── 002_plan_seed.sql
│   └── 002_plan_functions.xlsx
│
├── 005_Trigger Functions/         ← الخطوة 6-7: المشغلات + اختباريين
│   ├── README.md
│   ├── 000_trigger_functions.sql
│   └── 002_create_test_user.sql
│
├── 006_Tests/                     ← الخطوة 8: الاختبارات
│   ├── README.md
│   └── 001_test_rls_policies.sql
│
└── README.md                      ← 📖 هذا الملف
```

---

## 🚀 دليل البدء السريع

### الخطوة 1: إنشاء الجداول

```sql
-- 001_Schema/001_schema.sql
-- يُنشئ 23 جدول + 12 ENUM + 60 فهرس + 31 مفتاح خارجي
```

### الخطوة 2: إنشاء الدوال المساعدة

```sql
-- 002_Utility Functions/000_utility_functions.sql
-- 20 دالة للتحقق من الصلاحيات والأدوار والاشتراكات
```

### الخطوة 3: تفعيل سياسات الأمان

```sql
-- 003_RLS Policies/002_rls_policies.sql
-- 70+ سياسة RLS لحماية البيانات
```

### الخطوة 4: إدخال بيانات الأدوار

```sql
-- 004_Seed Data/001_role_seed.sql
-- 5 أدوار نظام مع صلاحياتها
```

### الخطوة 5: إدخال الخطط وأسعار الصرف

```sql
-- 004_Seed Data/002_plan_seed.sql
-- 11 عملة + 9 خطط SaaS
```

### الخطوة 6: إعداد المشغلات الآلية

```sql
-- 005_Trigger Functions/000_trigger_functions.sql
-- مزامنة البروفايل + تحديث الطوابع الزمنية (19 trigger)
```

### الخطوة 7: مستخدمين اختباريين (تطوير فقط!)

```sql
-- 005_Trigger Functions/002_create_test_user.sql
-- 3 مستخدمين للتجربة
```

### الخطوة 8: تشغيل الاختبارات

```sql
-- 006_Tests/001_test_rls_policies.sql
-- 28 اختبار للتحقق من صحة كل شيء
```

---

## 📊 إحصائيات قاعدة البيانات

| العنصر            | العدد  |
| ----------------- | :----: |
| **جداول**         |   23   |
| **ENUMs**         |   12   |
| **فهارس**         |   60   |
| **مفاتيح خارجية** |   31   |
| **Triggers**      |   19   |
| **سياسات RLS**    |  70+   |
| **دوال مساعدة**   |   26   |
| **بيانات أولية**  | 25 سجل |

---

## 🏗️ الوحدات (Modules)

| #   | الوحدة         | الجداول | الوصف                         |
| --- | -------------- | :-----: | ----------------------------- |
| 2️⃣  | CORE           |    5    | المستخدمين، الأدوار، العناوين |
| 🔟  | EXCHANGE RATES |    1    | أسعار صرف العملات             |
| 3️⃣  | SAAS           |    2    | الخطط والاشتراكات             |
| 4️⃣  | STORE          |    5    | المتاجر، الفئات، المنتجات     |
| 5️⃣  | TRADE          |    2    | الطلبات والمبيعات             |
| 6️⃣  | FLEET          |    2    | التوصيل والسائقين             |
| 7️⃣  | SOCIAL         |    2    | التقييمات والمفضلة            |
| 8️⃣  | SUPPORT        |    2    | تذاكر الدعم                   |
| 9️⃣  | SYSTEM         |    2    | الإشعارات وسجل الأخطاء        |

---

## 🔐 الأمان

### سياسات RLS:

- ✅ جميع الجداول الـ 23 محمية بـ Row Level Security
- ✅ **PUBLIC** يمكنه فقط رؤية البيانات العامة (منتجات نشطة، متاجر، تقييمات)
- ✅ **authenticated** يدير بياناته فقط
- ✅ **admin** يتجاوز جميع القيود
- ✅ صلاحيات الأعمدة (Column-Level) على `core_profile`

### الدوال الأمنية:

| الدالة                  | الوصف                          |
| ----------------------- | ------------------------------ |
| `current_user_id()`     | معرف المستخدم من جلسة المصادقة |
| `is_admin()`            | التحقق من صفة المدير           |
| `get_vendor_id()`       | معرف متجر البائع               |
| `has_permission()`      | التحقق من صلاحية معينة         |
| `has_plan_permission()` | صلاحية من الخطة النشطة         |

---

## 📖 التوثيق

كل مجلد يحتوي على ملف `README.md` خاص به مع توثيق شامل:

| المجلد                   | الخطوة | التوثيق                                          |
| ------------------------ | :----: | ------------------------------------------------ |
| `001_Schema/`            |   1    | [📖 README](./001_Schema/README.md)              |
| `002_Utility Functions/` |   2    | [📖 README](./002_Utility%20Functions/README.md) |
| `003_RLS Policies/`      |   3    | [📖 README](./003_RLS%20Policies/README.md)      |
| `004_Seed Data/`         |  4-5   | [📖 README](./004_Seed%20Data/README.md)         |
| `005_Trigger Functions/` |  6-7   | [📖 README](./005_Trigger%20Functions/README.md) |
| `006_Tests/`             |   8    | [📖 README](./006_Tests/README.md)               |

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
  -f "003_RLS Policies/002_rls_policies.sql" \
  -f "004_Seed Data/001_role_seed.sql" \
  -f "004_Seed Data/002_plan_seed.sql" \
  -f "005_Trigger Functions/000_trigger_functions.sql" \
  -f "005_Trigger Functions/002_create_test_user.sql" \
  -f "006_Tests/001_test_rls_policies.sql"
```

---

## 📝 ملاحظات مهمة

- ✅ **ترتيب الملفات مهم:** كل ملف يعتمد على الملفات السابقة
- ✅ **آمن للتشغيل المتكرر:** جميع ملفات Seed Data تستخدم `ON CONFLICT DO UPDATE`
- 🔴 **لا تشغّل ملفات الاختبار في الإنتاج:** `002_create_test_user.sql` و `001_test_rls_policies.sql`
- ✅ **مراجعة أمان:** تم إزالة PUBLIC access على `auth_password_reset` tokens
- ✅ **حذف آمن:** `cleanup_unsynced_profiles()` يستخدم soft delete

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
