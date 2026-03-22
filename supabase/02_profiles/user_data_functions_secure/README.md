# 🔐 دوال بيانات المستخدم الآمنة

**الإصدار:** 2.0  
**تاريخ آخر تحديث:** 2026-03-22  
**المشروع:** Marketna E-Commerce

---

## 📋 فهرس المحتويات

- [نظرة عامة](#نظرة-عامة)
- [مبادئ الأمان](#مبادئ-الأمان)
- [قائمة الدوال](#قائمة-الدوال)
- [تفاصيل الدوال](#تفاصيل-الدوال)
- [أمثلة الاستخدام](#أمثلة-الاستخدام)
- [الأسئلة الشائعة](#الأسئلة-الشائعة)

---

## نظرة عامة

يحتوي هذا الملف على **5 دوال آمنة** للتعامل مع بيانات المستخدمين في نظام Marketna E-Commerce. تم تصميم هذه الدوال بحيث:

- ✅ **تعمل فقط مع المستخدم المصادق الحالي** باستخدام `auth.uid()`
- ✅ **تمنع الوصول لبيانات المستخدمين الآخرين** بشكل تلقائي
- ✅ **توفر صلاحيات مدمجة** من الأدوار والخطط
- ✅ **تتوافق مع نظام الأمان** في Supabase

---

## مبادئ الأمان

| المبدأ | الوصف | التطبيق |
|--------|-------|---------|
| 🔒 **عزل البيانات** | كل مستخدم يرى بياناته فقط | استخدام `auth.uid()` داخلياً |
| 🚫 **لا معاملات خارجية** | لا يمكن تمرير `user_id` | جميع الدوال بدون معاملات |
| 🛡️ **SECURITY DEFINER** | الدوال تعمل بصلاحيات محددة | منع الوصول غير المصرح به |
| 📍 **search_path محدد** | تحديد مسار البحث | منع هجمات البحث |
| 👑 **تحقق من الإدارة** | دالة واحدة للإداريين | تحقق داخلي من دور admin |

---

## قائمة الدوال

| # | اسم الدالة | الوصف | الأمان |
|---|-----------|-------|--------|
| 1 | [`get_my_complete_data()`](#1-get_my_complete_data) | جلب جميع بيانات المستخدم الحالي | ⭐⭐⭐⭐⭐ |
| 2 | [`get_my_permissions()`](#2-get_my_permissions) | جلب جميع صلاحيات المستخدم | ⭐⭐⭐⭐⭐ |
| 3 | [`do_i_have_permission()`](#3-do_i_have_permission) | التحقق من صلاحية معينة | ⭐⭐⭐⭐⭐ |
| 4 | [`get_my_setup_status()`](#4-get_my_setup_status) | حالة إعداد الحساب | ⭐⭐⭐⭐⭐ |
| 5 | [`get_user_complete_data_admin()`](#5-get_user_complete_data_admin) | جلب بيانات أي مستخدم (إداريين) | ⭐⭐⭐⭐ |

---

## تفاصيل الدوال

### 1️⃣ `get_my_complete_data()`

#### الوصف
دالة شاملة تجلب **جميع بيانات المستخدم الحالي** في استعلام واحد شامل.

#### الأمان
- ⭐⭐⭐⭐⭐ **آمن تماماً**
- ❌ لا تقبل أي معاملات
- ✅ تستخدم `auth.uid()` داخلياً

#### البيانات المرجعة

| المجموعة | الحقول |
|----------|--------|
| **الملف الشخصي** | `user_id`, `email`, `first_name`, `last_name`, `full_name`, `phone`, `avatar_url`, `bio`, `email_verified`, `phone_verified`, `created_at`, `updated_at`, `last_sign_in_at` |
| **الأدوار** | `roles` (JSONB), `role_names` (TEXT[]), `role_permissions` (JSONB) |
| **الخطط** | `plans` (JSONB), `active_plan_name`, `active_plan_status`, `plan_permissions` (JSONB) |
| **الصلاحيات** | `all_permissions` (JSONB) - دمج صلاحيات الأدوار والخطط |
| **الحالة** | `has_active_role`, `has_active_plan`, `is_fully_setup` |

#### مثال الاستخدام

```typescript
// Next.js / React
const { data, error } = await supabase.rpc('get_my_complete_data');

if (error) throw error;

console.log(data[0].full_name);        // اسم المستخدم
console.log(data[0].role_names);       // ['customer', 'vendor']
console.log(data[0].active_plan_name); // 'Premium Plan'
console.log(data[0].all_permissions);  // ['products:create', 'orders:read']
```

---

### 2️⃣ `get_my_permissions()`

#### الوصف
تجلب **جميع الصلاحيات** الممنوحة للمستخدم الحالي من:
- ✅ الأدوار النشطة (`profile_roles`)
- ✅ الخطط النشطة (`profile_plans`)

#### الأمان
- ⭐⭐⭐⭐⭐ **آمن تماماً**
- ❌ لا تقبل أي معاملات

#### النوع المرجع
`JSONB` - مصفوفة من الصلاحيات

#### مثال الاستخدام

```typescript
// جلب الصلاحيات
const { data: permissions } = await supabase.rpc('get_my_permissions');

// النتيجة: ["products:create", "products:read", "orders:read", "*:admin"]

// التحقق من صلاحية محددة
const canCreateProduct = permissions.includes('products:create');
const isAdmin = permissions.includes('*:admin');
```

---

### 3️⃣ `do_i_have_permission(p_permission TEXT)`

#### الوصف
دالة سريعة للتحقق مما إذا كان المستخدم يملك **صلاحية معينة**.

#### الأمان
- ⭐⭐⭐⭐⭐ **آمن تماماً**

#### المعاملات

| المعامل | النوع | الوصف | مطلوب |
|---------|-------|-------|--------|
| `p_permission` | TEXT | اسم الصلاحية للتحقق منها | ✅ نعم |

#### النوع المرجع
`BOOLEAN` - `true` إذا كانت الصلاحية موجودة، `false` إذا لم تكن

#### مثال الاستخدام

```typescript
// التحقق من صلاحية واحدة
const { data: canCreate } = await supabase.rpc('do_i_have_permission', {
  p_permission: 'products:create'
});

if (canCreate) {
  // عرض زر إضافة منتج
}

// التحقق من صلاحيات متعددة
const requiredPermissions = ['products:create', 'products:edit', 'products:delete'];
const results = await Promise.all(
  requiredPermissions.map(async (perm) => {
    const { data } = await supabase.rpc('do_i_have_permission', { p_permission: perm });
    return { permission: perm, allowed: data };
  })
);
```

---

### 4️⃣ `get_my_setup_status()`

#### الوصف
تتحقق من **حالة إعداد حساب المستخدم** وتحدد المكونات الناقصة.

#### الأمان
- ⭐⭐⭐⭐⭐ **آمن تماماً**

#### البيانات المرجعة

| الحقل | النوع | الوصف |
|-------|-------|-------|
| `has_profile` | BOOLEAN | هل الملف الشخصي موجود؟ |
| `has_active_role` | BOOLEAN | هل يوجد دور نشط؟ |
| `active_roles` | TEXT[] | قائمة الأدوار النشطة |
| `has_active_plan` | BOOLEAN | هل يوجد خطة نشطة؟ |
| `active_plan_name` | TEXT | اسم الخطة النشطة |
| `active_plan_status` | TEXT | حالة الخطة (active/trial) |
| `is_fully_setup` | BOOLEAN | هل الحساب مكتمل الإعداد؟ |
| `missing_components` | TEXT[] | المكونات الناقصة ['profile', 'role', 'plan'] |
| `message` | TEXT | رسالة وصفية للحالة |

#### مثال الاستخدام

```typescript
// التحقق من حالة الإعداد
const { data: status } = await supabase.rpc('get_my_setup_status');

if (!status[0].is_fully_setup) {
  console.log('المكونات الناقصة:', status[0].missing_components);
  console.log('الرسالة:', status[0].message);
  
  // توجيه المستخدم لإكمال الإعداد
  if (status[0].missing_components.includes('profile')) {
    router.push('/setup/profile');
  }
}
```

---

### 5️⃣ `get_user_complete_data_admin(p_target_user_id UUID)`

#### الوصف
دالة **للإداريين فقط** تسمح بجلب بيانات أي مستخدم في النظام.

#### الأمان
- ⭐⭐⭐⭐ **يتطلب تحقق داخلي**
- ✅ تتحقق من دور `admin` قبل تنفيذ الاستعلام
- 🚫 ترفض الطلب إذا لم يكن المستخدم إدارياً

#### المعاملات

| المعامل | النوع | الوصف | مطلوب |
|---------|-------|-------|--------|
| `p_target_user_id` | UUID | معرف المستخدم المستهدف | ✅ نعم |

#### التحقق الأمني
```sql
IF NOT EXISTS (
  SELECT 1 FROM public.profile_roles pr
  JOIN public.roles r ON r.id = pr.role_id
  WHERE pr.user_id = auth.uid()
    AND r.name = 'admin'
    AND pr.is_active = TRUE
) THEN
  RAISE EXCEPTION 'Access denied: Admin role required';
END IF;
```

#### مثال الاستخدام

```typescript
// لوحة تحكم المديرين
async function getUserData(userId: string) {
  const { data, error } = await supabase.rpc('get_user_complete_data_admin', {
    p_target_user_id: userId
  });
  
  if (error) {
    // ERROR: Access denied: Admin role required
    console.error('خطأ: يتطلب دور إداري');
    return null;
  }
  
  return data[0];
}

// استخدام
const userData = await getUserData('some-user-uuid');
```

---

## أمثلة الاستخدام

### 🎯 حالة استخدام كاملة في React

```typescript
// hooks/useUserData.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useUserData() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase.rpc('get_my_complete_data');
        if (error) throw error;
        setUserData(data[0]);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { userData, loading };
}

// hooks/usePermission.ts
export function usePermission(permission: string) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkPermission() {
      const { data } = await supabase.rpc('do_i_have_permission', {
        p_permission: permission
      });
      setAllowed(data);
    }
    checkPermission();
  }, [permission]);

  return allowed;
}

// مكون محمي
function CreateProductButton() {
  const canCreate = usePermission('products:create');
  
  if (!canCreate) return null;
  
  return (
    <button onClick={() => router.push('/products/new')}>
      إضافة منتج جديد
    </button>
  );
}
```

### 🎯 حالة استخدام في Next.js Server Components

```typescript
// app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // جلب بيانات المستخدم
  const { data: userData } = await supabase.rpc('get_my_complete_data');
  const user = userData?.[0];
  
  // التحقق من الصلاحيات
  const { data: canEditProducts } = await supabase.rpc('do_i_have_permission', {
    p_permission: 'products:edit'
  });
  
  return (
    <div>
      <h1>مرحباً، {user?.full_name}</h1>
      <p>الخطة: {user?.active_plan_name}</p>
      <p>الأدوار: {user?.role_names?.join(', ')}</p>
      
      {canEditProducts && (
        <a href="/products/edit">تعديل المنتجات</a>
      )}
    </div>
  );
}
```

### 🎯 حالة استخدام للإداريين

```typescript
// app/admin/users/[id]/page.tsx
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export default async function UserPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  // محاولة جلب بيانات المستخدم (ستفشل إذا لم يكن إدارياً)
  const { data: userData, error } = await supabase.rpc('get_user_complete_data_admin', {
    p_target_user_id: params.id
  });
  
  if (error || !userData?.length) {
    notFound(); // أو عرض صفحة "غير مصرح"
  }
  
  const user = userData[0];
  
  return (
    <div>
      <h1>بيانات المستخدم</h1>
      <p>الاسم: {user.full_name}</p>
      <p>البريد: {user.email}</p>
      <p>الأدوار: {user.role_names?.join(', ')}</p>
      <p>الخطط: {JSON.stringify(user.plans)}</p>
    </div>
  );
}
```

---

## الأسئلة الشائعة

### ❓ لماذا لا توجد دالة تقبل `user_id` كمعامل؟

**إجابة:** هذا تصميم أمني متعمد. عند عدم السماح بتمرير `user_id`، لا يمكن للمستخدمين محاولة الوصول لبيانات مستخدمين آخرين حتى لو حاولوا التلاعب بالطلبات.

### ❓ كيف يمكن للإداريين عرض بيانات المستخدمين الآخرين؟

**إجابة:** استخدم الدالة `get_user_complete_data_admin()`. هذه الدالة تتحقق داخلياً من أن المستخدم يملك دور `admin` قبل السماح بالوصول.

### ❓ ما الفرق بين `role_permissions` و `plan_permissions` و `all_permissions`؟

**إجابة:**
- `role_permissions`: الصلاحيات من الأدوار فقط
- `plan_permissions`: الصلاحيات من الخطط فقط
- `all_permissions`: دمج الصلاحيات من المصدرين معاً (بدون تكرار)

### ❓ هل يمكن استخدام هذه الدوال في Row Level Security (RLS)؟

**إجابة:** نعم! جميع الدوال:
- ✅ `STABLE` - يمكن استخدامها في Views و Indexes
- ✅ `SECURITY DEFINER` - تعمل بصلاحيات محددة
- ✅ متوافقة مع RLS Policies

### ❓ ماذا يحدث إذا لم يكن المستخدم مسجلاً؟

**إجابة:** `auth.uid()` سيعيد `NULL`، وستعيد الدوال بيانات فارغة أو `null`.

---

## 📞 الدعم

للأسئلة أو المشاكل التقنية، يرجى فتح Issue في المستودع أو التواصل مع فريق التطوير.

---

**تم التوثيق بواسطة:** فريق تطوير Marketna  
**تاريخ التوثيق:** 2026-03-22
