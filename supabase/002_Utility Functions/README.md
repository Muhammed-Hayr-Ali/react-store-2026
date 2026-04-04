# 002_Utility Functions — الدوال المساعدة

> **الوصف:** يحتوي على 20 دالة مساعدة (Utility Functions) تُستخدم في سياسات RLS والتحقق من الصلاحيات وإدارة الاشتراكات والخطط.

---

## 📂 محتويات المجلد

| الملف                                                      | الوصف                | ترتيب التنفيذ |
| ---------------------------------------------------------- | -------------------- | :-----------: |
| [`000_utility_functions.sql`](./000_utility_functions.sql) | 20 دالة مساعدة موحدة | **الخطوة 2**  |

---

## ⚠️ ملاحظة مهمة

> 📌 **جميع الدوال موجودة في ملف واحد:** `000_utility_functions.sql`
>
> جميعها تستخدم `SECURITY DEFINER` — تعمل بصلاحيات المنشئ (postgres)

---

## 📋 ملخص الدوال الـ 20

| القسم                        | عدد الدوال | الدوال                                                                                                                                                |
| ---------------------------- | :--------: | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔐 التحقق من الهوية والأدوار |     6      | `current_user_id`, `has_role`, `is_admin`, `is_vendor`, `is_delivery`, `get_user_roles`                                                               |
| 🎯 التحقق من الصلاحيات       |     2      | `has_permission`, `get_user_permissions`                                                                                                              |
| 🏪 إدارة المتاجر والمنتجات   |     3      | `get_vendor_id`, `is_store_owner`, `is_product_owner`                                                                                                 |
| 📦 إدارة الاشتراكات والخطط   |     7      | `get_user_plan`, `has_plan_permission`, `get_plan_permissions`, `has_plan_category`, `get_subscription_status`, `has_plan_feature`, `get_plan_expiry` |
| 👑 دوال إدارية               |     2      | `admin_get_all_subscriptions`, `admin_get_subscription_stats`                                                                                         |

---

## 💡 أمثلة استخدام سريعة

### التحقق من هوية المستخدم

```sql
SELECT public.current_user_id();          -- معرف المستخدم
SELECT public.is_admin();                 -- هل هو مدير؟
SELECT public.has_role('vendor'::role_name); -- هل هو بائع؟
```

### التحقق من الصلاحيات

```sql
SELECT public.has_permission('products:create');  -- صلاحية معينة
SELECT public.get_user_permissions();             -- جميع الصلاحيات
```

### إدارة المتاجر

```sql
SELECT public.get_vendor_id();             -- معرف متجر البائع
SELECT public.is_store_owner('uuid-here'); -- هل يملك هذا المتجر؟
```

### إدارة الاشتراكات

```sql
SELECT * FROM public.get_user_plan();              -- الخطة النشطة
SELECT public.has_plan_permission('analytics:advanced');
SELECT * FROM public.get_subscription_status();    -- حالة الاشتراك
```

---

## 🚀 طريقة التنفيذ

```bash
psql -h <host> -U <user> -d <database> -f "000_utility_functions.sql"
```

> ⚠️ يجب تشغيله **بعد** `001_Schema/001_schema.sql` (لأنه يستخدم أنواع ENUM)
> و **قبل** `003_RLS Policies/002_rls_policies.sql` (لأن السياسات تعتمد على الدوال)
