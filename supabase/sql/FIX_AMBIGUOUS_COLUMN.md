# إصلاح خطأ "column reference is ambiguous"

## 🔴 المشكلة

عند النقر على رابط إعادة تعيين كلمة المرور، ظهر الخطأ التالي:

```
📊 [verifyResetToken] RPC Response: {
  data: null,
  error: {
    code: '42702',
    details: 'It could refer to either a PL/pgSQL variable or a table column.',
    hint: null,
    message: 'column reference "expires_at" is ambiguous'
  }
}
```

---

## 📊 السبب

الخطأ `column reference "expires_at" is ambiguous` يحدث عندما:

1. **تضارب الأسماء:** العمود `expires_at` موجود في:
   - الجدول `password_reset_tokens`
   - المتغير `v_record.expires_at` (من RETURNING TABLE)

2. **PostgreSQL لا يعرف:** أي عمود تقصد في الاستعلام

3. **الاستعلام الغامض:**
   ```sql
   -- ❌ خطأ - PostgreSQL لا يعرف أي expires_at تقصد
   SELECT * FROM password_reset_tokens
   WHERE token = p_token
     AND expires_at > NOW()
   ```

---

## ✅ الحل

استخدم **اسم الجدول بشكل صريح** مع **alias**:

```sql
-- ✅ صحيح - تحديد الجدول بشكل واضح
SELECT prt.* INTO v_record
FROM public.password_reset_tokens prt
WHERE prt.token = p_token
  AND prt.expires_at > NOW()
  AND prt.used_at IS NULL;
```

---

## 📝 الملفات المحدثة

### 1. `supabase/03_password_reset_tokens/03_password_reset_tokens.sql`

#### دالة `verify_password_reset_token`

**قبل:**
```sql
CREATE OR REPLACE FUNCTION public.verify_password_reset_token(p_token TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  user_id UUID,
  email TEXT,
  expires_at TIMESTAMPTZ,
  message TEXT
) AS $$
DECLARE
  v_record RECORD;
BEGIN
  SELECT * INTO v_record
  FROM public.password_reset_tokens
  WHERE token = p_token
    AND expires_at > NOW()
    AND used_at IS NULL;
    -- ❌ expires_at غامض!

  IF v_record IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TIMESTAMPTZ, '...';
    -- ❌ أنواع البيانات غير واضحة
    RETURN;
  END IF;

  RETURN QUERY SELECT true, v_record.user_id, v_record.email, v_record.expires_at, '...';
  -- ❌ أنواع البيانات غير واضحة
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**بعد:**
```sql
CREATE OR REPLACE FUNCTION public.verify_password_reset_token(p_token TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  user_id UUID,
  email TEXT,
  expires_at TIMESTAMPTZ,
  message TEXT
) AS $$
DECLARE
  v_record RECORD;
BEGIN
  -- ✅ استخدام alias للجدول
  SELECT prt.* INTO v_record
  FROM public.password_reset_tokens prt
  WHERE prt.token = p_token
    AND prt.expires_at > NOW()
    AND prt.used_at IS NULL;

  IF v_record IS NULL THEN
    -- ✅ تحديد أنواع البيانات بشكل صريح
    RETURN QUERY SELECT 
      false::BOOLEAN, 
      NULL::UUID, 
      NULL::TEXT, 
      NULL::TIMESTAMPTZ, 
      'رمز غير صحيح أو منتهي الصلاحية'::TEXT;
    RETURN;
  END IF;

  -- ✅ تحديد أنواع البيانات بشكل صريح
  RETURN QUERY SELECT 
    true::BOOLEAN, 
    v_record.user_id, 
    v_record.email, 
    v_record.expires_at, 
    'رمز صالح'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### دالة `claim_password_reset_token`

**قبل:**
```sql
CREATE OR REPLACE FUNCTION public.claim_password_reset_token(p_token TEXT)
RETURNS TABLE (...) AS $$
BEGIN
  UPDATE public.password_reset_tokens
  SET used_at = NOW()
  WHERE token = p_token
    AND expires_at > NOW()
    AND used_at IS NULL;
    -- ❌ expires_at غامض!
  ...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**بعد:**
```sql
CREATE OR REPLACE FUNCTION public.claim_password_reset_token(p_token TEXT)
RETURNS TABLE (...) AS $$
BEGIN
  -- ✅ استخدام alias للجدول
  UPDATE public.password_reset_tokens prt
  SET prt.used_at = NOW()
  WHERE prt.token = p_token
    AND prt.expires_at > NOW()
    AND prt.used_at IS NULL;
  ...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 2. `supabase/sql/fix_verify_token_ambiguous.sql`

ملف SQL منفصل لتطبيق الإصلاح على قاعدة البيانات الموجودة.

**التطبيق:**
```sql
-- في Supabase Dashboard → SQL Editor
-- انسخ والصق هذا الملف
-- اضغط Run
```

---

## 🎯 خطوات التطبيق

### الطريقة 1: Supabase Dashboard (موصى به)

1. اذهب إلى **Supabase Dashboard**
2. انتقل إلى **SQL Editor**
3. افتح ملف `supabase/sql/fix_verify_token_ambiguous.sql`
4. انسخ المحتوى والصقه في المحرر
5. اضغط **Run**

### الطريقة 2: تطبيق التحديث من الملف الرئيسي

1. افتح ملف `supabase/03_password_reset_tokens/03_password_reset_tokens.sql`
2. انسخ الدوال المحدثة
3. الصقها في **SQL Editor**
4. اضغط **Run**

---

## ✅ التحقق من الإصلاح

بعد التطبيق، اختبر:

```sql
-- 1. إنشاء رمز اختبار
SELECT create_password_reset_token(
  '00000000-0000-0000-0000-000000000000'::UUID,
  'test@example.com',
  60,
  '127.0.0.1'::INET
) as test_token;

-- 2. التحقق من الرمز (يجب أن يعمل بدون أخطاء)
SELECT * FROM verify_password_reset_token('TOKEN_FROM_STEP_1');

-- النتيجة المتوقعة:
-- is_valid | user_id | email | expires_at | message
-- TRUE     | uuid    | email | timestamp  | 'رمز صالح'

-- 3. استهلاك الرمز
SELECT * FROM claim_password_reset_token('TOKEN_FROM_STEP_1');

-- النتيجة المتوقعة:
-- is_valid | user_id | email | message
-- TRUE     | uuid    | email | 'تم قبول الرمز بنجاح'

-- 4. محاولة استخدام الرمز مرة أخرى (يجب أن يفشل)
SELECT * FROM claim_password_reset_token('TOKEN_FROM_STEP_1');

-- النتيجة المتوقعة:
-- is_valid | user_id | email | message
-- FALSE    | NULL    | NULL  | 'رمز غير صحيح أو منتهي أو مُستخدم مسبقاً'
```

---

## 📋 ملخص التغييرات

| التغيير | قبل | بعد |
|---------|-----|-----|
| **اسم الجدول** | `FROM password_reset_tokens` | `FROM password_reset_tokens prt` |
| **الأعمدة** | `WHERE expires_at > NOW()` | `WHERE prt.expires_at > NOW()` |
| **أنواع الإرجاع** | `SELECT false, NULL` | `SELECT false::BOOLEAN, NULL::UUID` |
| **الرسائل** | `'...'` | `'...'::TEXT` |

---

## 🔍 أسباب الخطأ الشائعة

### 1. تضارب الأسماء

```sql
-- ❌ خطأ
CREATE FUNCTION test(p_token TEXT)
RETURNS TABLE (token TEXT) AS $$
BEGIN
  SELECT * FROM table WHERE token = p_token;
  -- أي token تقصد؟ العمود أم المتغير؟
END;
$$ LANGUAGE plpgsql;
```

```sql
-- ✅ صحيح
CREATE FUNCTION test(p_token TEXT)
RETURNS TABLE (token TEXT) AS $$
BEGIN
  SELECT t.* FROM table t WHERE t.token = p_token;
  -- واضح: t.token = العمود، p_token = المتغير
END;
$$ LANGUAGE plpgsql;
```

### 2. RETURNING TABLE بدون تحديد أنواع

```sql
-- ❌ خطأ
RETURN QUERY SELECT false, NULL, 'message';
-- PostgreSQL لا يعرف أنواع البيانات

-- ✅ صحيح
RETURN QUERY SELECT false::BOOLEAN, NULL::UUID, 'message'::TEXT;
-- أنواع البيانات واضحة
```

---

## 📚 مراجع

- [PostgreSQL: Ambiguous Column](https://www.postgresql.org/docs/current/plpgsql-statements.html)
- [Supabase: RPC Functions](https://supabase.com/docs/guides/database/functions)

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
