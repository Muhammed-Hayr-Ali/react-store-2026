# نظام رموز إعادة تعيين كلمة المرور (Password Reset Tokens)

## 📋 نظرة عامة

نظام آمن لإدارة رموز إعادة تعيين كلمة المرور في منصة Marketna للتجارة الإلكترونية.

**الإصدار:** 1.0  
**التاريخ:** 2026-03-21  
**الاعتماديات:** لا يوجد (ملف مستقل)

---

## 📁 محتويات المجلد

| الملف | الوصف |
|-------|-------|
| `create_table.sql` | إنشاء جدول رموز إعادة التعيين والفهارس |
| `create_function.sql` | دوال إنشاء والتحقق من الرموز |
| `create_policy.sql` | سياسات الأمان (RLS) |
| `create_data.sql` | البيانات الافتراضية (لا يوجد) |

---

## 📊 بنية الجدول

### `public.password_reset_tokens`

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | UUID | المعرف الفريد للرمز |
| `user_id` | UUID | معرف المستخدم |
| `email` | TEXT | البريد الإلكتروني |
| `token` | TEXT | الرمز السري (64 حرف) |
| `expires_at` | TIMESTAMPTZ | وقت الانتهاء |
| `used_at` | TIMESTAMPTZ | وقت الاستخدام |
| `ip_address` | INET | عنوان IP للتدقيق |
| `created_at` | TIMESTAMPTZ | تاريخ الإنشاء |

---

## 🔧 الدوال المتاحة

| الدالة | الوصف |
|--------|-------|
| `create_password_reset_token()` | إنشاء رمز جديد |
| `claim_password_reset_token()` | التحقق الذري والاستهلاك |
| `verify_password_reset_token()` | التحقق فقط (للعرض) |
| `cleanup_expired_reset_tokens()` | تنظيف الرموز القديمة |

---

## 🔒 سياسات الأمان

- ✅ منع القراءة العامة تماماً
- ✅ الوصول الكامل للخدمة الخلفية فقط

---

## 📝 طريقة الاستخدام

```sql
-- إنشاء رمز
SELECT create_password_reset_token('user-uuid', 'user@example.com', 60);

-- التحقق من الرمز
SELECT * FROM claim_password_reset_token('token-here');
```

---

## ✅ نهاية الملف
