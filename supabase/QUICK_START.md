# 🚀 دليل التشغيل السريع

## الترتيب الصحيح للتشغيل

### ✅ الطريقة 1: التشغيل اليدوي (SQL Editor)

1. **افتح Supabase Dashboard** → **SQL Editor** → **New Query**

2. **شغّل الملفات بالترتيب:**

```
# 1. الإعدادات الأساسية
supabase/01-exchange_rates/exchange_rates.sql
supabase/02_password_reset_tokens/password_reset.sql
supabase/03_profiles_schema/profiles_schema.sql

# 2. نظام الأدوار والصلاحيات
supabase/04_roles_permissions_system/01_roles_permissions_system.sql

# 3. خطط الاشتراكات
supabase/04_seller_subscriptions/01_seller_subscription_plans.sql
supabase/05_delivery_subscriptions/01_delivery_subscription_plans.sql

# 4. جدول الباعة
supabase/06_sellers/01_sellers_schema.sql

# 5. اشتراكات الباعة
supabase/04_seller_subscriptions/02_seller_subscriptions.sql
```

---

### ✅ الطريقة 2: Supabase CLI

```bash
# تثبيت CLI
npm install -g supabase

# تسجيل الدخول
supabase login

# ربط المشروع
supabase link --project-ref YOUR_PROJECT_REF

# تطبيق الكل
supabase db push
```

---

### ✅ الطريقة 3: psql (Connection String)

```bash
# احصل على Connection String من:
# Supabase Dashboard → Settings → Database → Connection string

# ثم شغّل:
psql "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres" \
  -f supabase/04_roles_permissions_system/01_roles_permissions_system.sql
```

---

## 📋 التحقق من النجاح

بعد التشغيل، نفّذ:

```sql
-- التحقق من الجداول
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- التحقق من الخطط
SELECT name, price_usd, max_products 
FROM seller_subscription_plans 
WHERE is_active = TRUE;

SELECT name, price_usd, max_orders_per_day, commission_rate 
FROM delivery_subscription_plans 
WHERE is_active = TRUE;
```

---

## ⚠️ ملاحظات مهمة

1. **الترتيب مهم!** اتبع الترتيب المذكور أعلاه
2. **جدول profiles** يجب أن يكون موجوداً قبل `sellers`
3. **خطط الاشتراكات** تُنفذ قبل الجداول الرئيسية
4. **اشتراكات الباعة** تُنفذ بعد جدول الباعة

---

## 🐛 حل المشاكل

### "relation does not exist"

```sql
-- تأكد من تشغيل الملفات بالترتيب الصحيح
-- تحقق من الجداول الموجودة
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

### "permission denied"

```sql
-- تحقق من صلاحياتك
SELECT public.is_admin();
SELECT public.has_role('admin');
```

### "function does not exist"

```sql
-- تحقق من الدوال
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
```

---

## 📞 الدعم

- 📚 التوثيق الكامل: [DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md)
- 📧 البريد: support@marketna.com

---

**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
