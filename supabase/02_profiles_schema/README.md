# نظام الملفات الشخصية (Profiles Schema)

## 📋 نظرة عامة

هذا الملف يحتوي على مخطط الملفات الشخصية (Profiles) لمنصة Marketna للتجارة الإلكترونية. يدير النظام البيانات الشخصية للمستخدمين مع تكامل كامل مع نظام الأدوار والصلاحيات (RBAC).

**الاعتماديات:** يتطلب تنفيذ `01_roles_permissions_system.sql` أولاً.

---

## 📁 محتويات الملف

1. [أنواع البيانات (ENUMS)](#1-أنواع-البيانات-enums)
2. [جدول الملفات الشخصية](#2-جدول-الملفات-الشخصية)
3. [الفهرسة](#3-الفهرسة)
4. [دوال ومشغلات النظام](#4-دوال-ومشغلات-النظام)
5. [دوال القراءة العامة](#5-دوال-القراءة-العامة)
6. [سياسات الأمان](#6-سياسات-الأمان-row-level-security)
7. [العرض الآمن](#7-العرض-الآمن-للمعلومات-العامة)
8. [أمثلة الاستخدام](#8-أمثلة-الاستخدام)

---

## 1. أنواع البيانات (ENUMS)

### نوع `gender`

يُستخدم لتخزين النوع الاجتماعي للمستخدم.

| القيمة | الوصف |
|--------|-------|
| `male` | ذكر |
| `female` | أنثى |
| `prefer_not_to_say` | يفضل عدم الإفصاح |

**التعريف:**
```sql
CREATE TYPE gender AS ENUM ('male', 'female', 'prefer_not_to_say');
```

**ملاحظة:** يتم الإنشاء بشكل مشروط (IF NOT EXISTS) لتجنب الأخطاء عند إعادة التنفيذ.

---

## 2. جدول الملفات الشخصية `public.profiles`

### 2.1 بنية الجدول

| العمود | النوع | القيود | الوصف |
|--------|-------|--------|-------|
| **الهوية والربط** |
| `id` | UUID | PRIMARY KEY, FK→auth.users | معرف المستخدم (من auth.users) |
| `email` | TEXT | UNIQUE, NOT NULL | البريد الإلكتروني |
| **المعلومات الأساسية** |
| `first_name` | TEXT | | الاسم الأول |
| `last_name` | TEXT | | اسم العائلة |
| `full_name` | TEXT | GENERATED STORED | الاسم الكامل (محسوب تلقائيًا) |
| **الأدوار والصلاحيات** |
| `role` | TEXT | DEFAULT 'customer' | الدور الحالي (customer, vendor, admin, support) |
| `is_verified` | BOOLEAN | DEFAULT FALSE | هل الحساب موثوق؟ |
| **بيانات التواصل** |
| `phone` | TEXT | | رقم الهاتف |
| `phone_verified` | BOOLEAN | DEFAULT FALSE | هل الهاتف موثق؟ |
| `avatar_url` | TEXT | | رابط الصورة الشخصية |
| `bio` | TEXT | | نبذة تعريفية |
| **التفضيلات** |
| `language` | TEXT | DEFAULT 'ar' | اللغة المفضلة |
| `timezone` | TEXT | DEFAULT 'Asia/Damascus' | المنطقة الزمنية |
| **الحالة والتواريخ** |
| `email_verified` | BOOLEAN | DEFAULT FALSE | هل البريد موثق؟ |
| `date_of_birth` | DATE | | تاريخ الميلاد |
| `gender` | gender | | النوع الاجتماعي |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | تاريخ الإنشاء |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | تاريخ آخر تحديث |
| `last_sign_in_at` | TIMESTAMPTZ | DEFAULT NOW() | تاريخ آخر تسجيل دخول |

---

### 2.2 الحقول المحسوبة (Generated Columns)

#### `full_name`

حقل محسوب تلقائيًا من `first_name` و `last_name`:

```sql
full_name TEXT GENERATED ALWAYS AS (
  NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), '')
) STORED
```

**السلوك:**
- إذا كان كلا الحقلين فارغين → `NULL`
- إذا كان أحدهما فارغًا → يعرض الحقل الموجود فقط
- إذا كانا موجودين → يعرضهما مفصولين بمسافة

---

### 2.3 القيود والعلاقات

| النوع | الوصف |
|-------|-------|
| **PRIMARY KEY** | `id` - المعرف الفريد |
| **FOREIGN KEY** | `id` → `auth.users(id)` مع `ON DELETE CASCADE` |
| **UNIQUE** | `email` - البريد الإلكتروني فريد |
| **DEFAULT** | `role` = 'customer', `language` = 'ar', `timezone` = 'Asia/Damascus' |

---

## 3. الفهرسة

تم إنشاء فهارس لتحسين أداء الاستعلامات:

| الفهرس | الأعمدة | الوصف |
|--------|---------|-------|
| `idx_profiles_email` | `email` | البحث بالبريد الإلكتروني |
| `idx_profiles_role` | `role` | تصفية حسب الدور |
| `idx_profiles_role_verified` | `role, is_verified` | تصفية مركبة (للبائعين الموثوقين) |
| `idx_profiles_created_at` | `created_at DESC` | ترتيب حسب تاريخ الإنشاء |
| `idx_profiles_last_sign_in` | `last_sign_in_at DESC` | ترتيب حسب آخر دخول |

---

## 4. دوال ومشغلات النظام

### 4.1 `handle_new_user()`

**الوصف:** دالة تنشئ ملفًا شخصيًا تلقائيًا عند تسجيل مستخدم جديد في `auth.users`.

**نوع المشغل:** `AFTER INSERT ON auth.users`

**العمليات التي تقوم بها:**

1. **إنشاء ملف شخصي:**
   ```sql
   INSERT INTO public.profiles (
     id, email, first_name, last_name, avatar_url, role, last_sign_in_at
   )
   VALUES (
     NEW.id,
     NEW.email,
     COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
     COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
     COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
     'customer',
     NEW.last_sign_in_at
   );
   ```

2. **منح دور `customer` تلقائيًا:**
   ```sql
   INSERT INTO public.user_roles (user_id, role_id, granted_by)
   SELECT NEW.id, r.id, NEW.id
   FROM public.roles r WHERE r.name = 'customer'
   ON CONFLICT (user_id, role_id) DO NOTHING;
   ```

**مثال على الاستخدام التلقائي:**
```typescript
// عند التسجيل في التطبيق
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      first_name: 'أحمد',
      last_name: 'محمد',
      avatar_url: 'https://...'
    }
  }
});

// تلقائيًا:
// 1. يتم إنشاء سجل في auth.users
// 2. يتم إنشاء ملف شخصي في public.profiles
// 3. يتم منح دور 'customer'
```

---

### 4.2 `update_updated_at_column()`

**الوصف:** تحدث حقل `updated_at` تلقائيًا عند أي تحديث على الجدول.

**المشغل:**
```sql
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**مثال:**
```sql
UPDATE public.profiles SET first_name = 'محمد' WHERE id = 'uuid';
-- updated_at يتم تحديثه تلقائيًا إلى NOW()
```

---

### 4.3 `handle_user_login()`

**الوصف:** تحدث `last_sign_in_at` و `updated_at` عند تسجيل دخول المستخدم.

**نوع المشغل:** `AFTER UPDATE OF last_sign_in_at ON auth.users`

**الكود:**
```sql
UPDATE public.profiles 
SET last_sign_in_at = NEW.last_sign_in_at, updated_at = NOW() 
WHERE id = NEW.id;
```

**مثال على الاستخدام التلقائي:**
```typescript
// عند تسجيل الدخول
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// تلقائيًا:
// - يتم تحديث last_sign_in_at في profiles
```

---

## 5. دوال القراءة العامة

### 5.1 `get_public_profile(profile_id UUID)`

**الوصف:** الحصول على المعلومات العامة لمستخدم معين (بدون بيانات حساسة).

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `profile_id` | UUID | معرف المستخدم |

**الإرجاع:** TABLE

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | UUID | المعرف |
| `full_name` | TEXT | الاسم الكامل |
| `avatar_url` | TEXT | الصورة الشخصية |
| `bio` | TEXT | النبذة |
| `role` | TEXT | الدور |
| `is_verified` | BOOLEAN | موثق أم لا |
| `created_at` | TIMESTAMPTZ | تاريخ الإنشاء |

**مثال:**
```sql
SELECT * FROM public.get_public_profile('user-uuid-here');
```

**في TypeScript:**
```typescript
const { data } = await supabase
  .rpc('get_public_profile', { profile_id: userId })
  .single();
```

---

### 5.2 `get_public_vendors()`

**الوصف:** الحصول على قائمة البائعين الموثوقين فقط.

**الإرجاع:** TABLE

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | UUID | المعرف |
| `full_name` | TEXT | الاسم الكامل |
| `avatar_url` | TEXT | الصورة الشخصية |
| `bio` | TEXT | النبذة |
| `is_verified` | BOOLEAN | موثق |
| `created_at` | TIMESTAMPTZ | تاريخ الإنشاء |

**مثال:**
```sql
SELECT * FROM public.get_public_vendors();
-- يعرض البائعين الموثوقين فقط (role='vendor' AND is_verified=TRUE)
```

**في TypeScript:**
```typescript
const { data: vendors } = await supabase
  .rpc('get_public_vendors')
  .select('*');
```

---

## 6. سياسات الأمان (Row Level Security)

جدول `profiles` مفعل عليه RLS مع السياسات التالية:

### 6.1 سياسات القراءة (SELECT)

| السياسة | للمستخدمين | الشرط |
|---------|-----------|-------|
| `users_read_own` | authenticated | `auth.uid() = id` (يقرأ ملفه فقط) |
| `admins_read_all` | authenticated | `public.has_role('admin')` (المدير يقرأ الكل) |
| `users_read_public_info` | authenticated | `TRUE` (الجميع يقرأ المعلومات العامة) |
| `support_read_all` | authenticated | `public.has_role('support')` (الدعم يقرأ الكل) |

**مثال:**
```sql
-- مستخدم عادي يمكنه قراءة ملفه فقط
SELECT * FROM public.profiles WHERE id = auth.uid(); -- ✅

-- لا يمكنه قراءة ملفات الآخرين مباشرة
SELECT * FROM public.profiles WHERE id != auth.uid(); -- ❌

-- لكن يمكنه استخدام الدالة العامة
SELECT * FROM public.get_public_profile(other_user_id); -- ✅
```

---

### 6.2 سياسات التعديل (UPDATE)

| السياسة | للمستخدمين | الشرط |
|---------|-----------|-------|
| `users_update_own` | authenticated | `auth.uid() = id` |
| `admins_update_all` | authenticated | `public.has_role('admin')` |
| `support_update_all` | authenticated | `public.has_role('support')` |

**مثال:**
```sql
-- المستخدم يمكنه تعديل ملفه فقط
UPDATE public.profiles SET first_name = 'أحمد' WHERE id = auth.uid(); -- ✅

-- المدير يمكنه تعديل أي ملف
UPDATE public.profiles SET is_verified = TRUE WHERE id = 'other-uuid'; -- ✅ (للمدير فقط)
```

---

### 6.3 سياسات الإدراج (INSERT)

| السياسة | للمستخدمين | الشرط |
|---------|-----------|-------|
| `users_insert_own` | authenticated | `auth.uid() = id` |
| `admins_insert_any` | authenticated | `public.has_role('admin')` |

**ملاحظة:** عمليًا، الملفات تُنشأ تلقائيًا عبر المشغل `handle_new_user`.

---

### 6.4 سياسات الحذف (DELETE)

| السياسة | للمستخدمين | الشرط |
|---------|-----------|-------|
| `users_delete_own` | authenticated | `auth.uid() = id` |
| `admins_delete_all` | authenticated | `public.has_role('admin')` |

**مثال:**
```sql
-- المستخدم يحذف ملفه (يؤدي لحذف حسابه)
DELETE FROM public.profiles WHERE id = auth.uid(); -- ✅

-- المدير يحذف أي ملف
DELETE FROM public.profiles WHERE id = 'other-uuid'; -- ✅ (للمدير فقط)
```

---

## 7. العرض الآمن للمعلومات العامة

### عرض `public.public_profiles`

**الوصف:** عرض آمن يحتوي فقط على المعلومات العامة (بدون بيانات حساسة).

**التعريف:**
```sql
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  role,
  is_verified,
  created_at
FROM public.profiles;
```

**البيانات المستبعدة:**
- ❌ `email` - البريد الإلكتروني (حساس)
- ❌ `phone` - رقم الهاتف (حساس)
- ❌ `date_of_birth` - تاريخ الميلاد (حساس)
- ❌ `gender` - النوع الاجتماعي (حساس)
- ❌ `first_name`, `last_name` - منفصلين

**مثال:**
```sql
-- قراءة آمنة من العرض
SELECT * FROM public.public_profiles WHERE id = 'user-uuid';

-- لا يمكن الوصول للبيانات الحساسة
SELECT email FROM public.public_profiles; -- ❌ خطأ (العمود غير موجود)
```

---

## 8. أمثلة الاستخدام

### 8.1 في SQL

```sql
-- تحديث الملف الشخصي
UPDATE public.profiles
SET 
  first_name = 'أحمد',
  last_name = 'محمد',
  phone = '+963912345678',
  bio = 'بائع منتجات إلكترونية'
WHERE id = auth.uid();

-- الحصول على ملفي الشخصي
SELECT * FROM public.profiles WHERE id = auth.uid();

-- الحصول على ملف عام لمستخدم آخر
SELECT * FROM public.get_public_profile('other-user-uuid');

-- الحصول على جميع البائعين الموثوقين
SELECT * FROM public.get_public_vendors();

-- تحديث تفضيلات اللغة
UPDATE public.profiles
SET language = 'en', timezone = 'Asia/Riyadh'
WHERE id = auth.uid();
```

---

### 8.2 في Next.js / TypeScript

```typescript
// hooks/useProfile.ts
import { useSupabase } from '@/hooks/useSupabase'

export function useProfile() {
  const supabase = useSupabase()

  // الحصول على الملف الشخصي
  const getProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single()
    
    return { data, error }
  }

  // تحديث الملف الشخصي
  const updateProfile = async (updates: Partial<typeof data>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .select()
      .single()
    
    return { data, error }
  }

  // الحصول على ملف عام
  const getPublicProfile = async (userId: string) => {
    const { data, error } = await supabase
      .rpc('get_public_profile', { profile_id: userId })
      .single()
    
    return { data, error }
  }

  // الحصول على البائعين
  const getVendors = async () => {
    const { data, error } = await supabase
      .rpc('get_public_vendors')
      .select('*')
    
    return { data, error }
  }

  return {
    getProfile,
    updateProfile,
    getPublicProfile,
    getVendors
  }
}
```

---

### 8.3 في مكونات React

```tsx
// components/ProfileForm.tsx
import { useState, useEffect } from 'react'
import { useProfile } from '@/hooks/useProfile'

export function ProfileForm() {
  const { getProfile, updateProfile } = useProfile()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    language: 'ar',
    timezone: 'Asia/Damascus'
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data } = await getProfile()
    if (data) {
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        bio: data.bio || '',
        language: data.language || 'ar',
        timezone: data.timezone || 'Asia/Damascus'
      })
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProfile(formData)
    alert('تم تحديث الملف الشخصي')
  }

  if (loading) return <div>جاري التحميل...</div>

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.first_name}
        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
        placeholder="الاسم الأول"
      />
      <input
        value={formData.last_name}
        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
        placeholder="اسم العائلة"
      />
      <input
        value={formData.phone}
        onChange={e => setFormData({ ...formData, phone: e.target.value })}
        placeholder="رقم الهاتف"
      />
      <textarea
        value={formData.bio}
        onChange={e => setFormData({ ...formData, bio: e.target.value })}
        placeholder="نبذة تعريفية"
      />
      <select
        value={formData.language}
        onChange={e => setFormData({ ...formData, language: e.target.value })}
      >
        <option value="ar">العربية</option>
        <option value="en">English</option>
      </select>
      <button type="submit">حفظ التغييرات</button>
    </form>
  )
}
```

---

### 8.4 عرض ملف بائع عام

```tsx
// components/VendorCard.tsx
import { useEffect, useState } from 'react'
import { useSupabase } from '@/hooks/useSupabase'

interface Vendor {
  id: string
  full_name: string
  avatar_url: string
  bio: string
  is_verified: boolean
}

export function VendorCard({ vendorId }: { vendorId: string }) {
  const supabase = useSupabase()
  const [vendor, setVendor] = useState<Vendor | null>(null)

  useEffect(() => {
    const loadVendor = async () => {
      const { data } = await supabase
        .rpc('get_public_profile', { profile_id: vendorId })
        .single()
      
      if (data) setVendor(data as Vendor)
    }

    loadVendor()
  }, [vendorId])

  if (!vendor) return null

  return (
    <div className="vendor-card">
      {vendor.avatar_url && (
        <img src={vendor.avatar_url} alt={vendor.full_name} />
      )}
      <h3>{vendor.full_name}</h3>
      {vendor.is_verified && <span className="badge">✓ موثوق</span>}
      <p>{vendor.bio}</p>
    </div>
  )
}
```

---

### 8.5 صفحة قائمة البائعين

```tsx
// app/vendors/page.tsx
import { createClient } from '@/utils/supabase/server'
import { VendorCard } from '@/components/VendorCard'

export default async function VendorsPage() {
  const supabase = createClient()
  
  const { data: vendors } = await supabase
    .rpc('get_public_vendors')
    .select('*')
  
  return (
    <div>
      <h1>البائعون الموثوقون</h1>
      <div className="grid">
        {vendors?.map(vendor => (
          <VendorCard key={vendor.id} vendorId={vendor.id} />
        ))}
      </div>
    </div>
  )
}
```

---

## 🔐 أفضل الممارسات الأمنية

### 1. استخدام الدوال العامة للقراءة
```typescript
// ✅ صحيح - يستخدم الدالة الآمنة
const { data } = await supabase
  .rpc('get_public_profile', { profile_id: userId })

// ❌ خطأ - يحاول قراءة مباشرة (قد يفشل بسبب RLS)
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
```

### 2. حماية البيانات الحساسة
```sql
-- ✅ استخدم العرض العام
SELECT * FROM public.public_profiles;

-- ❌ لا تعرض البيانات الحساسة في الواجهات العامة
SELECT email, phone, date_of_birth FROM public.profiles;
```

### 3. التحقق من الصلاحيات
```sql
-- في سياسات RLS، استخدم دوال النظام
USING (public.has_role('admin'))

-- بدلاً من التحقق المباشر
USING (role = 'admin') -- ❌ أقل أمانًا
```

---

## 📊 مخطط العلاقات

```
┌─────────────────────────┐
│      auth.users         │
│  (Supabase Auth)        │
├─────────────────────────┤
│ id (PK)                 │
│ email                   │
│ raw_user_meta_data      │
│ last_sign_in_at         │
└───────────┬─────────────┘
            │
            │ 1:1 (ON DELETE CASCADE)
            ▼
┌─────────────────────────┐
│      profiles           │
├─────────────────────────┤
│ id (PK, FK)             │
│ email                   │
│ first_name              │
│ last_name               │
│ full_name (generated)   │
│ role                    │
│ is_verified             │
│ phone                   │
│ avatar_url              │
│ bio                     │
│ language                │
│ timezone                │
│ date_of_birth           │
│ gender (ENUM)           │
│ created_at              │
│ updated_at              │
│ last_sign_in_at         │
└───────────┬─────────────┘
            │
            │ N:1
            ▼
┌─────────────────────────┐
│      user_roles         │
│  (من 01_roles_...)      │
└─────────────────────────┘
```

---

## ⚠️ ملاحظات هامة

1. **الإنشاء التلقائي:** الملفات الشخصية تُنشأ تلقائيًا عند التسجيل عبر المشغل `handle_new_user`.

2. **الحذف المتسلسل:** عند حذف مستخدم من `auth.users`، يُحذف ملفه الشخصي تلقائيًا (`ON DELETE CASCADE`).

3. **الأدوار المتعددة:** حقل `role` في `profiles` هو للدور الأساسي فقط. للأدوار المتعددة، استخدم جدول `user_roles`.

4. **البيانات المحسوبة:** `full_name` محسوب تلقائيًا ولا يمكن تعديله مباشرة.

5. **SECURITY DEFINER:** جميع الدوال تستخدم `SECURITY DEFINER` للتنفيذ بصلاحيات المنشئ.

---

## 🚀 الترقية والصيانة

### إضافة حقل جديد
```sql
ALTER TABLE public.profiles
ADD COLUMN website TEXT;

CREATE INDEX idx_profiles_website ON public.profiles(website);
```

### تحديث قيمة افتراضية
```sql
ALTER TABLE public.profiles
ALTER COLUMN language SET DEFAULT 'en';
```

### إضافة ENUM جديد
```sql
ALTER TYPE gender ADD VALUE 'non_binary';
```

---

## 📞 الدعم

لأي استفسارات أو مشاكل تقنية، يرجى التواصل مع فريق التطوير.

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform  
**الاعتماديات:** `01_roles_permissions_system.sql`
