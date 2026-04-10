# 🔒 توثيق سياسات الأمان (RLS Policies)

## 📋 جدول المحتويات

1. [ما هي RLS؟](#ما-هي-rls)
2. [ترتيب التنفيذ](#ترتيب-التنفيذ)
3. [ملخص السياسات](#ملخص-السياسات)
4. [السياسات حسب الجدول](#السياسات-حسب-الجدول)
5. [الأدوار والصلاحيات](#الأدوار-والصلاحيات)
6. [الدوال المستخدمة](#الدوال-المستخدمة)
7. [أمثلة عملية](#أمثلة-عملية)
8. [أفضل الممارسات](#أفضل-الممارسات)

---

## ما هي RLS؟

**Row Level Security (RLS)** هي ميزة في PostgreSQL تسمح بالتحكم في الوصول إلى البيانات على مستوى **الصفوف** بدلاً من الجداول الكاملة.

### 🔐 كيف تعمل؟

```
┌─────────────────────────────────────────┐
│          طلب SQL من المستخدم             │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│     فحص سياسة RLS المناسبة               │
│  (هل المستخدم مخوّل للوصول لهذا الصف؟)   │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
   ✅ مسموح         ❌ مرفوض
        │                │
        ▼                ▼
   إرجاع البيانات    إرجاع فارغ/خطأ
```

### ✅ الفوائد:

1. **أمان عالي** - كل مستخدم يرى بياناته فقط
2. **تحكم دقيق** - صلاحيات مختلفة لكل دور
3. **حماية تلقائية** - تطبق على جميع الاستعلامات
4. **أداء جيد** - مدمجة في قاعدة البيانات

---

## ترتيب التنفيذ

```
1️⃣ 001_Schema/001_schema.sql           ← إنشاء الجداول
2️⃣ 002_Utility Functions/...sql         ← إنشاء الدوال المساعدة
3️⃣ 003_RLS Policies/000_rls_policies.sql ← تطبيق سياسات الأمان ← أنت هنا
4️⃣ 004_Seed Data/001_role_seed.sql      ← بيانات الأدوار
```

### ⚠️ ملاحظات هامة:

- ✅ **يجب** تشغيل Utility Functions قبل RLS Policies
- ✅ **يجب** إنشاء الجداول قبل تطبيق السياسات
- ✅ **يجب** تفعيل RLS على كل جدول قبل إضافة السياسات

---

## ملخص السياسات

| الجدول                 | عدد السياسات | الوصف                   |
| ---------------------- | ------------ | ----------------------- |
| `core_profile`         | 5            | الملف الشخصي للمستخدم   |
| `core_role`            | 2            | الأدوار والصلاحيات      |
| `core_profile_role`    | 2            | ربط المستخدم بالأدوار   |
| `auth_password_reset`  | 4            | إعادة تعيين كلمة المرور |
| `core_address`         | 5            | عناوين المستخدمين       |
| `store_settings`       | 2            | إعدادات المتجر          |
| `store_category`       | 3            | تصنيفات المنتجات        |
| `store_product`        | 3            | المنتجات                |
| `product_image`        | 3            | صور المنتجات            |
| `product_variant`      | 3            | متغيرات المنتجات        |
| `trade_order`          | 6            | الطلبات                 |
| `trade_order_delivery` | 4            | تسليم الطلبات (QR Code) |
| `trade_order_item`     | 2            | عناصر الطلب             |
| `social_review`        | 4            | التقييمات               |
| `customer_favorite`    | 2            | المفضلة                 |
| `support_ticket`       | 4            | تذاكر الدعم             |
| `ticket_message`       | 3            | رسائل التذاكر           |
| `sys_notification`     | 3            | الإشعارات               |
| `system_error_log`     | 2            | سجل الأخطاء             |
| `exchange_rates`       | 2            | أسعار الصرف             |
| **المجموع**            | **65+**      | **20 جدول**             |

---

## السياسات حسب الجدول

### 1️⃣ `core_profile` - الملف الشخصي للمستخدم

| السياسة                     | الإجراء | الدور         | الوصف                                          |
| --------------------------- | ------- | ------------- | ---------------------------------------------- |
| `public_profiles_viewable`  | SELECT  | PUBLIC        | العامة يرون المعلومات الأساسية (الاسم، الصورة) |
| `users_view_own_profile`    | SELECT  | authenticated | المستخدم يرى ملفه كاملاً                       |
| `users_insert_own_profile`  | INSERT  | authenticated | المستخدم ينشئ ملفه عند التسجيل                 |
| `users_update_own_profile`  | UPDATE  | authenticated | المستخدم يعدل ملفه فقط                         |
| `admins_update_any_profile` | UPDATE  | authenticated | الأدمن يعدل أي ملف شخصي                        |

**الأعمدة المتاحة للعامة:**

- `id`, `full_name`, `avatar_url`, `created_at`

**الأعمدة المتاحة للمسجلين:**

- `id`, `email`, `phone_number`, `first_name`, `last_name`

---

### 2️⃣ `core_role` - الأدوار

| السياسة                 | الإجراء | الدور         | الوصف                   |
| ----------------------- | ------- | ------------- | ----------------------- |
| `roles_public_viewable` | SELECT  | PUBLIC        | الأدوار عامة للقراءة    |
| `admins_manage_roles`   | ALL     | authenticated | الأدمن يدير الأدوار فقط |

---

### 3️⃣ `core_profile_role` - ربط المستخدم بالأدوار

| السياسة                       | الإجراء | الدور         | الوصف                        |
| ----------------------------- | ------- | ------------- | ---------------------------- |
| `users_view_own_roles`        | SELECT  | authenticated | المستخدم يرى أدواره فقط      |
| `admins_manage_profile_roles` | ALL     | authenticated | الأدمن يدير أدوار المستخدمين |

---

### 4️⃣ `auth_password_reset` - إعادة تعيين كلمة المرور

| السياسة                           | الإجراء | الدور         | الوصف                    |
| --------------------------------- | ------- | ------------- | ------------------------ |
| `users_create_own_password_reset` | INSERT  | authenticated | المستخدم ينشئ طلب لنفسه  |
| `users_view_own_password_reset`   | SELECT  | authenticated | المستخدم يرى طلباته فقط  |
| `users_update_own_password_reset` | UPDATE  | authenticated | المستخدم يعدل طلباته فقط |
| `admins_manage_password_resets`   | ALL     | authenticated | الأدمن يدير جميع الطلبات |

**🔒 ملاحظة أمان:** التوكن حساس ولا يجب أن يكون عاماً!

---

### 5️⃣ `core_address` - العناوين

| السياسة                      | الإجراء | الدور         | الوصف                     |
| ---------------------------- | ------- | ------------- | ------------------------- |
| `users_view_own_addresses`   | SELECT  | authenticated | المستخدم يرى عناوينه فقط  |
| `users_insert_own_addresses` | INSERT  | authenticated | المستخدم ينشئ عناوينه فقط |
| `users_update_own_addresses` | UPDATE  | authenticated | المستخدم يعدل عناوينه فقط |
| `users_delete_own_addresses` | DELETE  | authenticated | المستخدم يحذف عناوينه فقط |
| `admins_manage_addresses`    | ALL     | authenticated | الأدمن يدير جميع العناوين |

---

### 6️⃣ `store_settings` - إعدادات المتجر

| السياسة                          | الإجراء | الدور         | الوصف                         |
| -------------------------------- | ------- | ------------- | ----------------------------- |
| `store_settings_public_viewable` | SELECT  | PUBLIC        | الإعدادات النشطة عامة للقراءة |
| `admins_manage_store_settings`   | ALL     | authenticated | الأدمن يدير الإعدادات فقط     |

---

### 7️⃣ `store_category` - تصنيفات المنتجات

| السياسة                        | الإجراء | الدور         | الوصف                      |
| ------------------------------ | ------- | ------------- | -------------------------- |
| `categories_public_viewable`   | SELECT  | PUBLIC        | الفئات النشطة عامة للقراءة |
| `admins_manage_all_categories` | ALL     | authenticated | الأدمن يدير جميع الفئات    |
| `vendors_manage_categories`    | ALL     | authenticated | الموظف/البائع يدير الفئات  |

---

### 8️⃣ `store_product` - المنتجات

| السياسة                       | الإجراء | الدور         | الوصف                        |
| ----------------------------- | ------- | ------------- | ---------------------------- |
| `products_public_viewable`    | SELECT  | PUBLIC        | المنتجات النشطة عامة للقراءة |
| `vendors_manage_own_products` | ALL     | authenticated | الموظف يدير منتجاته فقط      |
| `admins_manage_all_products`  | ALL     | authenticated | الأدمن يدير جميع المنتجات    |

**الشروط:**

- المنتجات النشطة: `is_active = true AND deleted_at IS NULL`

---

### 9️⃣ `product_image` - صور المنتجات

| السياسة                          | الإجراء | الدور         | الوصف                    |
| -------------------------------- | ------- | ------------- | ------------------------ |
| `product_images_public_viewable` | SELECT  | PUBLIC        | صور المنتجات النشطة عامة |
| `vendors_manage_own_images`      | ALL     | authenticated | الموظف يدير صور منتجاته  |
| `admins_manage_all_images`       | ALL     | authenticated | الأدمن يدير جميع الصور   |

---

### 🔟 `product_variant` - متغيرات المنتجات

| السياسة                       | الإجراء | الدور         | الوصف                        |
| ----------------------------- | ------- | ------------- | ---------------------------- |
| `variants_public_viewable`    | SELECT  | PUBLIC        | متغيرات المنتجات النشطة عامة |
| `vendors_manage_own_variants` | ALL     | authenticated | الموظف يدير متغيرات منتجاته  |
| `admins_manage_all_variants`  | ALL     | authenticated | الأدمن يدير جميع المتغيرات   |

---

### 1️⃣1️⃣ `trade_order` - الطلبات

| السياسة                       | الإجراء | الدور         | الوصف                            |
| ----------------------------- | ------- | ------------- | -------------------------------- |
| `customers_view_own_orders`   | SELECT  | authenticated | العميل يرى طلباته فقط            |
| `vendors_view_orders`         | SELECT  | authenticated | الموظف/الأدمن يرى جميع الطلبات   |
| `customers_insert_own_orders` | INSERT  | authenticated | العميل ينشئ طلباته فقط           |
| `customers_update_own_orders` | UPDATE  | authenticated | العميل يعدل طلباته (قبل التأكيد) |
| `vendors_update_orders`       | UPDATE  | authenticated | الموظف/الأدمن يعدل حالة الطلبات  |
| `admins_manage_all_orders`    | ALL     | authenticated | الأدمن يدير جميع الطلبات         |

**الشروط:**

- العميل يعدل فقط إذا: `customer_id = current_user_id() AND is_confirmed = false`

---

### 1️⃣2️⃣ `trade_order_delivery` - تسليم الطلبات (QR Code)

| السياسة                              | الإجراء | الدور         | الوصف                          |
| ------------------------------------ | ------- | ------------- | ------------------------------ |
| `customers_view_own_delivery_status` | SELECT  | authenticated | العميل يرى حالة تسليم طلباته   |
| `vendors_view_delivery_status`       | SELECT  | authenticated | الموظف/الأدمن يرى جميع الحالات |
| `delivery_update_delivery_status`    | UPDATE  | authenticated | موظف التوصيل يحدث حالة التسليم |
| `admins_manage_all_delivery_status`  | ALL     | authenticated | الأدمن يدير جميع الحالات       |

**📱 سير عمل QR Code:**

```
1. إنشاء الطلب → إنشاء verification_code
2. عرض QR Code في لوحة التحكم
3. الموظف يطبع QR ويضعه على الطلب
4. عند العميل → يمسح QR
5. verification_code يُتحقق منه
6. customer_verified = true
7. delivery_status = "delivered" ✅
```

---

### 1️⃣3️⃣ `trade_order_item` - عناصر الطلب

| السياسة                           | الإجراء | الدور         | الوصف                      |
| --------------------------------- | ------- | ------------- | -------------------------- |
| `order_items_follow_order_access` | SELECT  | authenticated | العناصر تتبع صلاحيات الطلب |
| `admins_manage_all_order_items`   | ALL     | authenticated | الأدمن يدير جميع العناصر   |

---

### 1️⃣4️⃣ `social_review` - التقييمات

| السياسة                    | الإجراء | الدور         | الوصف                      |
| -------------------------- | ------- | ------------- | -------------------------- |
| `reviews_public_viewable`  | SELECT  | PUBLIC        | التقييمات عامة للقراءة     |
| `users_insert_own_reviews` | INSERT  | authenticated | المستخدم ينشئ تقييماته فقط |
| `users_update_own_reviews` | UPDATE  | authenticated | المستخدم يعدل تقييماته فقط |
| `users_delete_own_reviews` | DELETE  | authenticated | المستخدم يحذف تقييماته فقط |

---

### 1️⃣5️⃣ `customer_favorite` - المفضلة

| السياسة                      | الإجراء | الدور         | الوصف                    |
| ---------------------------- | ------- | ------------- | ------------------------ |
| `users_view_own_favorites`   | SELECT  | authenticated | المستخدم يرى مفضلته فقط  |
| `users_manage_own_favorites` | ALL     | authenticated | المستخدم يدير مفضلته فقط |

---

### 1️⃣6️⃣ `support_ticket` - تذاكر الدعم

| السياسة                     | الإجراء | الدور         | الوصف                                 |
| --------------------------- | ------- | ------------- | ------------------------------------- |
| `users_view_own_tickets`    | SELECT  | authenticated | المستخدم يرى تذاكره أو المُسنَدة إليه |
| `users_insert_own_tickets`  | INSERT  | authenticated | المستخدم ينشئ تذاكره فقط              |
| `users_update_own_tickets`  | UPDATE  | authenticated | المستخدم يعدل تذاكره فقط              |
| `admins_manage_all_tickets` | ALL     | authenticated | الأدمن يدير جميع التذاكر              |

**الشروط:**

- يرى إذا: `reporter_id = current_user_id() OR assigned_to = current_user_id()`

---

### 1️⃣7️⃣ `ticket_message` - رسائل التذاكر

| السياسة                             | الإجراء | الدور         | الوصف                    |
| ----------------------------------- | ------- | ------------- | ------------------------ |
| `ticket_participants_view_messages` | SELECT  | authenticated | المشاركون يرون الرسائل   |
| `users_insert_own_messages`         | INSERT  | authenticated | المستخدم يرسل في تذاكره  |
| `admins_manage_all_messages`        | ALL     | authenticated | الأدمن يدير جميع الرسائل |

---

### 1️⃣8️⃣ `sys_notification` - الإشعارات

| السياسة                           | الإجراء | الدور         | الوصف                        |
| --------------------------------- | ------- | ------------- | ---------------------------- |
| `users_view_own_notifications`    | SELECT  | authenticated | المستخدم يرى إشعاراته فقط    |
| `users_update_own_notifications`  | UPDATE  | authenticated | المستخدم يحدد قراءة إشعاراته |
| `admins_manage_all_notifications` | ALL     | authenticated | الأدمن يدير جميع الإشعارات   |

---

### 1️⃣9️⃣ `system_error_log` - سجل الأخطاء

| السياسة                    | الإجراء | الدور         | الوصف                |
| -------------------------- | ------- | ------------- | -------------------- |
| `admins_view_error_logs`   | SELECT  | authenticated | الأدمن فقط يرى السجل |
| `admins_manage_error_logs` | ALL     | authenticated | الأدمن يدير السجل    |

---

### 2️⃣0️⃣ `exchange_rates` - أسعار الصرف

| السياسة                          | الإجراء | الدور         | الوصف                |
| -------------------------------- | ------- | ------------- | -------------------- |
| `exchange_rates_public_viewable` | SELECT  | PUBLIC        | الأسعار عامة للقراءة |
| `admins_manage_exchange_rates`   | ALL     | authenticated | الأدمن يدير الأسعار  |

---

## الأدوار والصلاحيات

### 👑 `admin` - مدير النظام

| الجدول       | الصلاحيات                                  |
| ------------ | ------------------------------------------ |
| جميع الجداول | **كاملة** (SELECT, INSERT, UPDATE, DELETE) |

**ملاحظات:**

- ✅ يتجاوز جميع القيود
- ✅ يستخدم دالة `is_admin()` للتحقق
- ✅ يدير جميع المستخدمين والطلبات والمنتجات

---

### 👨‍💼 `vendor` - بائع/موظف

| الجدول                 | الصلاحيات                |
| ---------------------- | ------------------------ |
| `store_product`        | إدارة المنتجات الخاصة به |
| `product_image`        | إدارة صور منتجاته        |
| `product_variant`      | إدارة متغيرات منتجاته    |
| `store_category`       | إدارة الفئات             |
| `trade_order`          | عرض وتحديث حالة الطلبات  |
| `trade_order_delivery` | عرض حالة التسليم         |

**ملاحظات:**

- ✅ يرى منتجاته فقط (`user_id = current_user_id()`)
- ✅ يعدل حالة الطلبات
- ✅ لا يرى بيانات العملاء الكاملة

---

### 👤 `customer` - عميل

| الجدول              | الصلاحيات             |
| ------------------- | --------------------- |
| `core_profile`      | إدارة ملفه الشخصي     |
| `core_address`      | إدارة عناوينه         |
| `trade_order`       | إنشاء وإدارة طلباته   |
| `social_review`     | إنشاء وتحرير تقييماته |
| `customer_favorite` | إدارة المفضلة         |
| `support_ticket`    | إنشاء تذاكر الدعم     |

**ملاحظات:**

- ✅ يرى طلباته فقط
- ✅ يعدل طلباته قبل التأكيد فقط
- ✅ لا يرى طلبات الآخرين

---

### 🚚 `delivery` - موظف توصيل

| الجدول                 | الصلاحيات                      |
| ---------------------- | ------------------------------ |
| `trade_order_delivery` | تحديث حالة التسليم عبر QR Code |

**ملاحظات:**

- ✅ يمسح QR Code للتحقق
- ✅ يحدث حالة التسليم فقط
- ✅ لا يرى بيانات الطلب الكاملة

---

### 🎧 `support` - دعم فني

| الجدول           | الصلاحيات                   |
| ---------------- | --------------------------- |
| `support_ticket` | إدارة تذاكر الدعم المُسنَدة |
| `ticket_message` | إرسال رسائل في التذاكر      |

**ملاحظات:**

- ✅ يرى التذاكر المُسنَدة إليه فقط
- ✅ يرد على الرسائل
- ✅ لا يرى الطلبات أو المنتجات

---

## الدوال المستخدمة

### 🔐 دوال التحقق من الهوية

| الدالة              | الوصف                      | الاستخدام              |
| ------------------- | -------------------------- | ---------------------- |
| `current_user_id()` | إرجاع معرف المستخدم الحالي | `SELECT auth.uid()`    |
| `has_role(role)`    | التحقق من دور معين         | `has_role('admin')`    |
| `is_admin()`        | التحقق من دور الأدمن       | `public.is_admin()`    |
| `is_vendor()`       | التحقق من دور البائع       | `public.is_vendor()`   |
| `is_delivery()`     | التحقق من دور التوصيل      | `public.is_delivery()` |

### 🏪 دوال المتجر

| الدالة                 | الوصف                  | الاستخدام                            |
| ---------------------- | ---------------------- | ------------------------------------ |
| `is_product_owner(id)` | التحقق من ملكية المنتج | `is_product_owner('uuid')`           |
| `get_store_settings()` | إعدادات المتجر         | `SELECT * FROM get_store_settings()` |

### 🚚 دوال التوصيل

| الدالة                                   | الوصف             | الاستخدام                              |
| ---------------------------------------- | ----------------- | -------------------------------------- |
| `create_delivery_verification(order_id)` | إنشاء رمز QR      | `create_delivery_verification('uuid')` |
| `verify_delivery(code)`                  | التحقق من التسليم | `verify_delivery('code')`              |

---

## أمثلة عملية

### مثال 1: عميل يرى طلباته فقط

```sql
-- العميل يحاول رؤية جميع الطلبات
SELECT * FROM trade_order;

-- RLS يطبق السياسة:
-- "customers_view_own_orders"
-- WHERE customer_id = current_user_id()

-- النتيجة: يرى طلباته فقط ✅
```

### مثال 2: موظف يعدل منتج

```sql
-- الموظف يحاول تعديل منتج
UPDATE store_product
SET price_base = 100
WHERE id = 'product-uuid';

-- RLS يطبق السياسة:
-- "vendors_manage_own_products"
-- WHERE user_id = current_user_id() OR is_vendor()

-- النتيجة: يعدل إذا كان المالك أو موظف ✅
```

### مثال 3: موظف التوصيل يحدث التسليم

```sql
-- موظف التوصيل يمسح QR Code
SELECT verify_delivery('verification-code-here');

-- RLS يطبق السياسة:
-- "delivery_update_delivery_status"
-- WHERE is_delivery() OR is_admin()

-- النتيجة: يحدث حالة التسليم ✅
```

---

## أفضل الممارسات

### ✅ افعل:

1. **استخدم الدوال المساعدة** - `is_admin()`, `has_role()`
2. **اختبر السياسات** - تأكد من كل سيناريو
3. **وثّق السياسات** - اشرح كل سياسة بوضوح
4. **راجع بانتظام** - تأكد من عدم وجود ثغرات
5. **استخدم `SECURITY DEFINER`** - للدوال الحساسة

### ❌ لا تفعل:

1. **لا تمنح صلاحيات زائدة** - الأقل امتيازاً دائماً
2. **لا تهمل الاختبار** - اختبر كل دور على حدة
3. **لا تنسى الأدمن** - تأكد من تجاوز القيود
4. **لا تستخدم استعلامات معقدة** - تؤثر على الأداء
5. **لا تنسى التوثيق** - حدّث هذا الملف مع كل تغيير

---

**📅 آخر تحديث:** 2026-04-08  
**📦 الإصدار:** 1.0.0  
**🔐 الجداول المحمية:** 20 جدول  
**📋 إجمالي السياسات:** 65+ سياسة
