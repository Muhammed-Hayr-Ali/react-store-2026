# 005_Trigger Functions — دوال المشغلات الآلية

> **الوصف:** يحتوي على دوال المشغلات (Trigger Functions) التي تُنفَّذ تلقائياً عند أحداث معينة.

---

## 📂 محتويات المجلد

| الملف                                                      | الوصف                |      ترتيب التنفيذ       |
| ---------------------------------------------------------- | -------------------- | :----------------------: |
| [`000_trigger_functions.sql`](./000_trigger_functions.sql) | 6 دوال + 19 Trigger  |       **الخطوة 6**       |
| [`002_create_test_user.sql`](./002_create_test_user.sql)   | 3 مستخدمين اختباريين | **الخطوة 7** (تطوير فقط) |

---

## 📋 000_trigger_functions.sql — المشغلات الآلية

### الدوال الـ 6:

| الدالة                        | الوصف                                          |
| ----------------------------- | ---------------------------------------------- |
| `sync_profile_data()`         | مزامنة `auth.users` مع `core_profile` تلقائياً |
| `update_updated_at_column()`  | تحديث `updated_at` عند كل تعديل                |
| `check_profile_sync_status()` | عرض حالة المزامنة                              |
| `cleanup_unsynced_profiles()` | تنظيف البروفايلات غير المتزامنة (حذف ناعم آمن) |
| `create_manual_profile()`     | إنشاء بروفايل يدوياً                           |
| `soft_delete_user()`          | حذف ناعم للمستخدم                              |

### الـ Triggers الـ 19:

جميع الجداول التي تحتوي `updated_at` لها trigger تلقائي:

```
core_profile        saas_plan            store_category       fleet_driver
core_role           saas_subscription    store_product        fleet_delivery
core_address        store_vendor         social_review        product_image
core_profile_role   sys_notification     support_ticket       product_variant
exchange_rates      system_error_log     ticket_message
```

---

## 📋 002_create_test_user.sql — مستخدمين اختباريين

| المستخدم | الإيميل             | كلمة المرور | الاسم     |
| -------- | ------------------- | :---------: | --------- |
| 1        | `test1@example.com` |  `123456`   | أحمد محمد |
| 2        | `test2@example.com` |  `123456`   | سارة علي  |
| 3        | `test3@example.com` |  `123456`   | خالد حسن  |

> 🔴 **للتطوير فقط — لا تشغّله في الإنتاج!**

---

## 🚀 طريقة التنفيذ

```bash
# الخطوة 6: المشغلات
psql -h <host> -U <user> -d <database> -f "000_trigger_functions.sql"

# الخطوة 7: مستخدمين اختباريين (تطوير فقط!)
psql -h <host> -U <user> -d <database> -f "002_create_test_user.sql"
```

> ⚠️ يجب تشغيل المشغلات **بعد** `001_Schema/001_schema.sql`
