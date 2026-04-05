# 001_Schema — هيكل قاعدة البيانات

> **الوصف:** يحتوي على الملفات التي تنشئ هيكل قاعدة البيانات بالكامل — الجداول، العلاقات، الفهارس، والمفاتيح الخارجية.

---

## 📂 محتويات المجلد

| الملف                                | الوصف                                                              | ترتيب التنفيذ |
| ------------------------------------ | ------------------------------------------------------------------ | :-----------: |
| [`000_dbml.dbml`](./000_dbml.dbml)   | مخطط ERD بصيغة DBML لعرضه على [dbdiagram.io](https://dbdiagram.io) | — (مرجعي فقط) |
| [`001_schema.sql`](./001_schema.sql) | إنشاء 23 جدول + 12 ENUM + 60 فهرس + 31 مفتاح خارجي                 | **الخطوة 1**  |

---

## 🔀 ترتيب التنفيذ الكامل

```
1. ✅ 001_Schema/001_schema.sql                 ← هذا الملف (الجداول والعلاقات)
2. ✅ 002_Utility Functions/000_utility_functions.sql  ← الدوال المساعدة
3. ✅ 003_RLS Policies/002_rls_policies.sql     ← سياسات الأمان
4. ✅ 004_Seed Data/001_role_seed.sql            ← بيانات الأدوار
5. ✅ 004_Seed Data/002_plan_seed.sql            ← الخطط وأسعار الصرف
6. ✅ 005_Trigger Functions/000_trigger_functions.sql  ← المشغلات الآلية
7. ✅ 005_Trigger Functions/002_create_test_user.sql   ← مستخدمين اختباريين
8. ✅ 006_Tests/001_test_rls_policies.sql        ← اختبار السياسات
```

> ⚠️ **تحذير:** الترتيب مهم جداً! كل ملف يعتمد على الملفات السابقة.

---

## 📋 001_schema.sql — هيكل قاعدة البيانات

### ما يفعله هذا الملف:

- إنشاء 12 نوع ENUM (حالات الطلب، الأدوار، الخطط، إلخ)
- إنشاء 23 جدولاً موزعة على 9 وحدات (Modules)
- إنشاء 60+ فهرس (Index) للأداء
- إنشاء 31 مفتاح خارجي (Foreign Key) مع قواعد `ON DELETE`

### الوحدات (Modules):

| #   | الوحدة         | الجداول | الوصف                                                  |
| --- | -------------- | :-----: | ------------------------------------------------------ |
| 2️⃣  | CORE           |    5    | المستخدمين، الأدوار، العناوين، إعادة تعيين كلمة المرور |
| 🔟  | EXCHANGE RATES |    1    | أسعار صرف العملات                                      |
| 3️⃣  | SAAS           |    2    | الخطط والاشتراكات                                      |
| 4️⃣  | STORE          |    5    | المتاجر، الفئات، المنتجات، الصور، المتغيرات            |
| 5️⃣  | TRADE          |    2    | الطلبات وعناصرها                                       |
| 6️⃣  | FLEET          |    2    | السائقين والتوصيل                                      |
| 7️⃣  | SOCIAL         |    2    | التقييمات والمفضلة                                     |
| 8️⃣  | SUPPORT        |    2    | تذاكر الدعم ورسائلها                                   |
| 9️⃣  | SYSTEM         |    2    | الإشعارات وسجل الأخطاء                                 |

### أنواع ENUM:

| النوع             | القيم                                                                      | الاستخدام         |
| ----------------- | -------------------------------------------------------------------------- | ----------------- |
| `role_name`       | `admin, vendor, customer, delivery, support`                               | أدوار المستخدمين  |
| `plan_category`   | `free, seller, delivery, enterprise`                                       | فئات خطط SaaS     |
| `order_status`    | `pending, confirmed, processing, shipping, delivered, cancelled`           | حالات الطلب       |
| `payment_status`  | `pending, paid, failed, refunded`                                          | حالات الدفع       |
| `delivery_status` | `pending, assigned, picked_up, in_transit, delivered, cancelled, returned` | حالات التوصيل     |
| `vendor_status`   | `pending, active, suspended, rejected, archived`                           | حالات المتاجر     |
| `sub_status`      | `active, expired, cancelled, pending_payment, trialing`                    | حالات الاشتراك    |
| `ticket_status`   | `open, in_progress, resolved, closed`                                      | حالات تذاكر الدعم |
| `ticket_priority` | `low, medium, high, urgent`                                                | أولويات التذاكر   |
| `notify_type`     | `order_event, system_alert, promo, review, ticket`                         | أنواع الإشعارات   |
| `error_severity`  | `info, warning, error, critical`                                           | شدة الأخطاء       |
| `payment_method`  | `cod, card, wallet`                                                        | طرق الدفع         |

### قواعد الحذف (ON DELETE):

| القاعدة    | عدد الاستخدامات | المعنى                               |
| ---------- | :-------------: | ------------------------------------ |
| `CASCADE`  |       15        | حذف السجل الأب يحذف الأبناء تلقائياً |
| `SET NULL` |        9        | حذف السجل الأب يجعل المرجع NULL      |
| `RESTRICT` |        7        | منع حذف السجل الأب إذا كان له أبناء  |

---

## 📊 إحصائيات

| العنصر        | العدد |
| ------------- | :---: |
| جداول         |  23   |
| ENUMs         |  12   |
| فهارس         |  60   |
| مفاتيح خارجية |  31   |

---

## 🚀 طريقة التنفيذ

### عبر Supabase Dashboard:

```
1. ادخل إلى Supabase Dashboard
2. افتح SQL Editor
3. الصق محتوى 001_schema.sql
4. اضغط Run
```

### عبر psql:

```bash
psql -h <host> -U <user> -d <database> -f "001_schema.sql"
```

---

## 📝 ملاحظات هامة

- ✅ هذا الملف **لا يعتمد على أي ملف آخر** — يجب تشغيله أولاً
- ✅ جميع الجداول تحتوي على `created_at` افتراضي
- ✅ 19 جدول من أصل 23 يحتوي على `updated_at` + trigger
- ✅ الأعمدة `deleted_at` موجودة في: `core_profile`, `store_vendor`, `store_product` (soft delete)
