# نظام الأدوار والصلاحيات المتقدم (Advanced RBAC System)

## 📋 نظرة عامة

هذا الملف يحتوي على نظام متكامل لإدارة الأدوار والصلاحيات (Role-Based Access Control - RBAC) مصمم خصيصًا لمنصة Marketna للتجارة الإلكترونية. يوفر النظام تحكمًا دقيقًا في صلاحيات المستخدمين مع دعم متعدد التجار (Multi-Vendor).

---

## 📁 محتويات الملف

1. [الإضافات المطلوبة](#1-الإضافات-المطلوبة)
2. [جداول النظام الأساسية](#2-جداول-النظام-الأساسية)
3. [الفهرسة](#3-الفهرسة)
4. [البيانات الافتراضية](#4-البيانات-الافتراضية)
5. [دوال التحقق من الصلاحيات](#5-دوال-التحقق-من-الصلاحيات)
6. [دوال التحقق من الملكية](#6-دوال-التحقق-من-الملكية)
7. [دوال إدارة الأدوار والصلاحيات](#7-دوال-إدارة-الأدوار-والصلاحيات)
8. [سياسات الأمان](#8-سياسات-الأمان-row-level-security)
9. [مشغلات التحديث التلقائي](#9-مشغلات-التحديث-التلقائي)
10. [أمثلة الاستخدام](#10-أمثلة-الاستخدام)

---

## 1. الإضافات المطلوبة

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

| الإضافة | الوصف |
|---------|-------|
| `pg_trgm` | دعم البحث النصي المتقدم (Trigram) |
| `uuid-ossp` | توليد معرفات فريدة من نوع UUID |

---

## 2. جداول النظام الأساسية

### 2.1 جدول الأدوار `public.roles`

يخزن جميع الأدوار المتاحة في النظام.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | UUID | المعرف الفريد للدور (تلقائي) |
| `name` | TEXT | اسم الدور (فريد) |
| `description` | TEXT | وصف الدور |
| `is_system` | BOOLEAN | هل هو دور نظام؟ (لا يمكن حذفه) |
| `created_at` | TIMESTAMPTZ | تاريخ الإنشاء |
| `updated_at` | TIMESTAMPTZ | تاريخ آخر تحديث |

**الأدوار الافتراضية:**
- `admin` - مدير النظام (صلاحيات كاملة)
- `vendor` - بائع (إدارة المنتجات والطلبات)
- `customer` - عميل (تصفح وشراء فقط)
- `support` - دعم فني (قراءة وتعديل محدود)

---

### 2.2 جدول الصلاحيات `public.permissions`

يخزن جميع الصلاحيات المتاحة في النظام.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | UUID | المعرف الفريد للصلاحية (تلقائي) |
| `name` | TEXT | اسم الصلاحية (فريد) |
| `description` | TEXT | وصف الصلاحية |
| `resource` | TEXT | المورد (مثلاً: products, orders) |
| `action` | TEXT | الإجراء (مثلاً: create, read, update, delete) |
| `created_at` | TIMESTAMPTZ | تاريخ الإنشاء |

**الصلاحيات الافتراضية:**

| الصلاحية | المورد | الإجراء | الوصف |
|----------|--------|---------|-------|
| `profile:read` | profile | read | قراءة الملف الشخصي |
| `profile:update` | profile | update | تعديل الملف الشخصي |
| `profile:delete` | profile | delete | حذف الملف الشخصي |
| `products:read` | products | read | قراءة المنتجات |
| `products:create` | products | create | إنشاء منتج |
| `products:update` | products | update | تعديل منتج |
| `products:delete` | products | delete | حذف منتج |
| `orders:read` | orders | read | قراءة الطلبات |
| `orders:create` | orders | create | إنشاء طلب |
| `orders:update` | orders | update | تعديل طلب |
| `orders:cancel` | orders | cancel | إلغاء طلب |
| `users:read` | users | read | قراءة بيانات المستخدمين |
| `users:update` | users | update | تعديل بيانات المستخدمين |
| `users:delete` | users | delete | حذف المستخدمين |
| `users:manage_roles` | users | manage_roles | إدارة أدوار المستخدمين |

---

### 2.3 جدول أدوار المستخدمين `public.user_roles`

يربط المستخدمين بالأدوار الممنوحة لهم.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | UUID | المعرف الفريد (تلقائي) |
| `user_id` | UUID | معرف المستخدم (من auth.users) |
| `role_id` | UUID | معرف الدور |
| `granted_by` | UUID | من منح الدور (معرف المستخدم) |
| `granted_at` | TIMESTAMPTZ | تاريخ المنح |
| `expires_at` | TIMESTAMPTZ | تاريخ الانتهاء (اختياري - للأدوار المؤقتة) |

**قيود:**
- كل مستخدم يمكن أن يملك دورًا واحدًا فقط من كل نوع (UNIQUE constraint)
- عند حذف المستخدم، تحذف جميع أدواره (ON DELETE CASCADE)
- عند حذف الدور، تحذف جميع assignments (ON DELETE CASCADE)

---

### 2.4 جدول صلاحيات الأدوار `public.role_permissions`

يربط الأدوار بالصلاحيات الممنوحة لها.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | UUID | المعرف الفريد (تلقائي) |
| `role_id` | UUID | معرف الدور |
| `permission_id` | UUID | معرف الصلاحية |
| `granted_at` | TIMESTAMPTZ | تاريخ المنح |

**قيود:**
- كل دور يمكن أن يملك صلاحية واحدة فقط من كل نوع (UNIQUE constraint)
- عند حذف الدور أو الصلاحية، تحذف العلاقة (ON DELETE CASCADE)

---

## 3. الفهرسة

تم إنشاء فهارس لتحسين الأداء:

```sql
CREATE INDEX idx_roles_name ON public.roles(name);
CREATE INDEX idx_permissions_resource ON public.permissions(resource);
CREATE INDEX idx_permissions_action ON public.permissions(action);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions(permission_id);
```

---

## 4. البيانات الافتراضية

### 4.1 توزيع الصلاحيات على الأدوار

| الدور | الصلاحيات الممنوحة |
|-------|-------------------|
| **admin** | جميع الصلاحيات (كاملة) |
| **vendor** | profile (read, update, delete), products (read, create, update, delete), orders (read, create, update, delete) |
| **customer** | profile (read, update), products (read), orders (read, create) |
| **support** | profile (read, update), users (read, update), orders (read, update) |

---

## 5. دوال التحقق من الصلاحيات

### 5.1 `has_role(role_name TEXT)`

**الوصف:** التحقق مما إذا كان المستخدم يملك دورًا محددًا.

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `role_name` | TEXT | اسم الدور المطلوب التحقق منه |

**الإرجاع:** `BOOLEAN` (TRUE إذا كان يملك الدور)

**مثال:**
```sql
SELECT public.has_role('admin');
-- TRUE إذا كان المستخدم مديرًا
```

---

### 5.2 `has_permission(permission_name TEXT)`

**الوصف:** التحقق مما إذا كان المستخدم يملك صلاحية محددة بالاسم.

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `permission_name` | TEXT | اسم الصلاحية (مثلاً: 'products:create') |

**الإرجاع:** `BOOLEAN`

**مثال:**
```sql
SELECT public.has_permission('products:delete');
-- TRUE إذا كان يملك صلاحية حذف المنتجات
```

---

### 5.3 `has_permission_on_resource(resource_name TEXT, action_name TEXT)`

**الوصف:** التحقق من صلاحية على مورد وإجراء محددين.

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `resource_name` | TEXT | اسم المورد (مثلاً: 'products') |
| `action_name` | TEXT | الإجراء (مثلاً: 'create') |

**الإرجاع:** `BOOLEAN`

**مثال:**
```sql
SELECT public.has_permission_on_resource('products', 'create');
-- TRUE إذا كان يملك صلاحية إنشاء المنتجات
```

---

### 5.4 `get_user_roles()`

**الوصف:** الحصول على جميع أدوار المستخدم الحالي.

**الإرجاع:** TABLE(role_name TEXT, granted_at TIMESTAMPTZ)

**مثال:**
```sql
SELECT * FROM public.get_user_roles();
-- يعرض جميع أدوار المستخدم الحالي
```

---

### 5.5 `get_user_permissions()`

**الوصف:** الحصول على جميع صلاحيات المستخدم الحالي.

**الإرجاع:** TABLE(permission_name TEXT, resource TEXT, action TEXT)

**مثال:**
```sql
SELECT * FROM public.get_user_permissions();
-- يعرض جميع صلاحيات المستخدم الحالي
```

---

### 5.6 `is_admin()`

**الوصف:** التحقق مما إذا كان المستخدم مديرًا.

**الإرجاع:** `BOOLEAN`

**مثال:**
```sql
SELECT public.is_admin();
-- TRUE إذا كان المستخدم مديرًا
```

---

## 6. دوال التحقق من الملكية

### 6.1 `owns_record(table_name TEXT, record_id UUID)`

**الوصف:** التحقق من ملكية سجل في جدول عام.

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `table_name` | TEXT | اسم الجدول (مثلاً: 'products') |
| `record_id` | UUID | معرف السجل |

**الإرجاع:** `BOOLEAN`

**مثال:**
```sql
SELECT public.owns_record('products', '123e4567-e89b-12d3-a456-426614174000');
-- TRUE إذا كان المستخدم يملك هذا المنتج
```

**ملاحظة:** يفترض أن الجدول يحتوي على عمود `vendor_id` أو `user_id`.

---

### 6.2 `owns_product(product_id UUID)`

**الوصف:** التحقق من ملكية منتج (مُحسّنة للأداء).

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `product_id` | UUID | معرف المنتج |

**الإرجاع:** `BOOLEAN`

**مثال:**
```sql
SELECT public.owns_product('123e4567-e89b-12d3-a456-426614174000');
```

---

### 6.3 `owns_order(order_id UUID)`

**الوصف:** التحقق من ملكية طلب (مُحسّنة للأداء).

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `order_id` | UUID | معرف الطلب |

**الإرجاع:** `BOOLEAN`

**مثال:**
```sql
SELECT public.owns_order('123e4567-e89b-12d3-a456-426614174000');
-- TRUE إذا كان المستخدم هو من قدم هذا الطلب
```

---

### 6.4 `can_manage_record(table_name TEXT, record_id UUID, action_name TEXT)`

**الوصف:** التحقق الشامل (الصلاحية + الملكية) - **الدالة الأهم للأمان**.

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `table_name` | TEXT | اسم الجدول |
| `record_id` | UUID | معرف السجل |
| `action_name` | TEXT | الإجراء المطلوب (مثلاً: 'delete') |

**الإرجاع:** `BOOLEAN`

**منطق التحقق:**
```
RETURN is_admin OR (has_perm AND is_owner);
```

**مثال:**
```sql
SELECT public.can_manage_record('products', '123e4567-e89b-12d3-a456-426614174000', 'delete');
-- TRUE إذا كان:
-- 1. المستخدم مديرًا، OR
-- 2. يملك صلاحية products:delete AND يملك المنتج
```

---

### 6.5 `can_manage_product(product_id UUID, action_name TEXT)`

**الوصف:** التحقق الشامل للمنتجات (مُحسّنة للأداء).

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `product_id` | UUID | معرف المنتج |
| `action_name` | TEXT | الإجراء المطلوب |

**الإرجاع:** `BOOLEAN`

**مثال:**
```sql
SELECT public.can_manage_product('123e4567-e89b-12d3-a456-426614174000', 'update');
```

---

## 7. دوال إدارة الأدوار والصلاحيات

### 7.1 `grant_role_to_user(target_user_id UUID, role_name TEXT)`

**الوصف:** منح دور لمستخدم (للمدراء فقط).

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `target_user_id` | UUID | معرف المستخدم المستهدف |
| `role_name` | TEXT | اسم الدور لمنحه |

**الإرجاع:** `BOOLEAN`

**الشروط:**
- يجب أن يكون المستخدم الحالي مديرًا
- يجب أن يكون الدور موجودًا

**مثال:**
```sql
SELECT public.grant_role_to_user('user-uuid-here', 'vendor');
-- منح دور البائع لمستخدم
```

---

### 7.2 `revoke_role_from_user(target_user_id UUID, role_name TEXT)`

**الوصف:** سحب دور من مستخدم (للمدراء فقط).

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `target_user_id` | UUID | معرف المستخدم المستهدف |
| `role_name` | TEXT | اسم الدور لسحبه |

**الإرجاع:** `BOOLEAN`

**الشروط:**
- يجب أن يكون المستخدم الحالي مديرًا
- لا يمكن للمستخدم إزالة دور المدير عن نفسه

**مثال:**
```sql
SELECT public.revoke_role_from_user('user-uuid-here', 'vendor');
-- سحب دور البائع من مستخدم
```

---

### 7.3 `grant_permission_to_role(role_name TEXT, permission_name TEXT)`

**الوصف:** منح صلاحية لدور (للمدراء فقط).

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `role_name` | TEXT | اسم الدور |
| `permission_name` | TEXT | اسم الصلاحية |

**الإرجاع:** `BOOLEAN`

**مثال:**
```sql
SELECT public.grant_permission_to_role('vendor', 'users:read');
-- منح صلاحية قراءة المستخدمين لدور البائع
```

---

### 7.4 `revoke_permission_from_role(role_name TEXT, permission_name TEXT)`

**الوصف:** سحب صلاحية من دور (للمدراء فقط).

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `role_name` | TEXT | اسم الدور |
| `permission_name` | TEXT | اسم الصلاحية |

**الإرجاع:** `BOOLEAN`

**الشروط:**
- لا يمكن سحب الصلاحيات من أدوار النظام (is_system = TRUE)

**مثال:**
```sql
SELECT public.revoke_permission_from_role('support', 'users:update');
-- سحب صلاحية تعديل المستخدمين من دور الدعم
```

---

## 8. سياسات الأمان (Row Level Security)

### 8.1 جدول الأدوار `public.roles`

| السياسة | النوع | الشرط |
|---------|-------|-------|
| `roles_public_read` | SELECT | الجميع يمكنهم القراءة |
| `roles_admin_manage` | ALL | المدراء فقط يمكنهم الإدارة |

---

### 8.2 جدول الصلاحيات `public.permissions`

| السياسة | النوع | الشرط |
|---------|-------|-------|
| `permissions_public_read` | SELECT | الجميع يمكنهم القراءة |
| `permissions_admin_manage` | ALL | المدراء فقط يمكنهم الإدارة |

---

### 8.3 جدول أدوار المستخدمين `public.user_roles`

| السياسة | النوع | الشرط |
|---------|-------|-------|
| `user_roles_read_own` | SELECT | المستخدم يقرأ أدواره فقط |
| `user_roles_admin_read_all` | SELECT | المدراء يقرأون جميع الأدوار |
| `user_roles_admin_manage` | ALL | المدراء فقط يديرون الأدوار |

---

### 8.4 جدول صلاحيات الأدوار `public.role_permissions`

| السياسة | النوع | الشرط |
|---------|-------|-------|
| `role_permissions_public_read` | SELECT | الجميع يمكنهم القراءة |
| `role_permissions_admin_manage` | ALL | المدراء فقط يمكنهم الإدارة |

---

## 9. مشغلات التحديث التلقائي

### `update_updated_at_column()`

**الوصف:** دالة تحدث `updated_at` تلقائيًا عند أي تحديث على جدول `roles`.

**الجدول المطبق عليه:** `public.roles`

---

## 10. أمثلة الاستخدام

### 10.1 في استعلامات SQL

```sql
-- التحقق من الصلاحية قبل إنشاء منتج
INSERT INTO public.products (name, price, vendor_id)
SELECT 'منتج جديد', 99.99, auth.uid()
WHERE public.has_permission('products:create');

-- التحقق من الملكية قبل التعديل
UPDATE public.products
SET price = 149.99
WHERE id = 'product-uuid'
  AND public.can_manage_product(id, 'update');

-- حذف مشروط بالصلاحية والملكية
DELETE FROM public.products
WHERE id = 'product-uuid'
  AND public.can_manage_product(id, 'delete');
```

---

### 10.2 في سياسات RLS

```sql
-- سياسة للمنتجات: البائع يدير منتجاته فقط
CREATE POLICY "vendors_manage_own_products" ON public.products
FOR ALL TO authenticated
USING (
  public.has_permission_on_resource('products', 'read')
  AND (
    public.is_admin()
    OR public.has_permission_on_resource('products', 'create')
    AND vendor_id = auth.uid()
  )
)
WITH CHECK (
  public.has_permission_on_resource('products', 'create')
  AND vendor_id = auth.uid()
);
```

---

### 10.3 في Edge Functions

```typescript
// التحقق من الصلاحية في Supabase Edge Function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function createProduct(req: Request) {
  const supabase = createClient(...)
  
  // التحقق من الصلاحية
  const { data: hasPermission } = await supabase.rpc(
    'has_permission',
    { permission_name: 'products:create' }
  )
  
  if (!hasPermission) {
    return new Response('Unauthorized', { status: 403 })
  }
  
  // إنشاء المنتج...
}
```

---

### 10.4 في Next.js

```typescript
// components/ProductForm.tsx
import { useSupabase } from '@/hooks/useSupabase'

export function ProductForm() {
  const supabase = useSupabase()
  
  const checkPermission = async () => {
    const { data } = await supabase
      .rpc('has_permission', { 
        permission_name: 'products:create' 
      })
      .single()
    
    return data
  }
  
  const handleSubmit = async (data) => {
    const canCreate = await checkPermission()
    if (!canCreate) {
      alert('ليس لديك صلاحية إنشاء منتجات')
      return
    }
    
    // إنشاء المنتج...
  }
  
  return (...)
}
```

---

### 10.5 إدارة الأدوار (للمدراء)

```sql
-- منح دور بائع لمستخدم جديد
SELECT public.grant_role_to_user(
  'new-vendor-user-uuid',
  'vendor'
);

-- التحقق من أدوار المستخدم
SELECT * FROM public.get_user_roles();

-- سحب الدور إذا لزم الأمر
SELECT public.revoke_role_from_user(
  'user-uuid',
  'vendor'
);
```

---

## 🔐 أفضل الممارسات الأمنية

### 1. استخدام الدوال المُحسّنة
استخدم الدوال المخصصة لكل جدول بدلاً من الدوال العامة للأداء الأفضل:
```sql
-- ✅ أفضل
SELECT public.owns_product(product_id);
SELECT public.can_manage_product(product_id, 'delete');

-- ❌ أقل أداءً
SELECT public.owns_record('products', product_id);
SELECT public.can_manage_record('products', product_id, 'delete');
```

### 2. التحقق المزدوج (الصلاحية + الملكية)
دائمًا استخدم `can_manage_*` للعمليات الحساسة:
```sql
-- ✅ صحيح
DELETE FROM products
WHERE id = $1 AND public.can_manage_product($1, 'delete');

-- ❌ خطأ (قد يسمح لغير المالك بالحذف)
DELETE FROM products
WHERE id = $1 AND public.has_permission('products:delete');
```

### 3. حماية أدوار النظام
أدوار النظام (is_system = TRUE) لا يمكن تعديل صلاحياتها:
```sql
-- سيرفع خطأ
SELECT public.revoke_permission_from_role('admin', 'products:delete');
```

### 4. منع إزالة دور المدير عن النفس
```sql
-- سيرفع خطأ
SELECT public.revoke_role_from_user(auth.uid(), 'admin');
```

---

## 📊 مخطط العلاقات (ERD)

```
┌─────────────────┐         ┌─────────────────────┐
│     roles       │         │    permissions      │
├─────────────────┤         ├─────────────────────┤
│ id (PK)         │         │ id (PK)             │
│ name            │         │ name                │
│ description     │         │ description         │
│ is_system       │         │ resource            │
│ created_at      │         │ action              │
│ updated_at      │         │ created_at          │
└────────┬────────┘         └──────────┬──────────┘
         │                             │
         │         ┌───────────────────┘
         │         │
         ▼         ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│      user_roles         │         │    role_permissions     │
├─────────────────────────┤         ├─────────────────────────┤
│ id (PK)                 │         │ id (PK)                 │
│ user_id (FK→auth.users) │         │ role_id (FK→roles)      │
│ role_id (FK→roles)      │         │ permission_id (FK)      │
│ granted_by (FK)         │         │ granted_at              │
│ granted_at              │         └─────────────────────────┘
│ expires_at              │
└─────────────────────────┘
```

---

## 🚀 الترقية والصيانة

### إضافة دور جديد
```sql
INSERT INTO public.roles (name, description, is_system)
VALUES ('moderator', 'مراقب - صلاحيات متوسطة', FALSE);
```

### إضافة صلاحية جديدة
```sql
INSERT INTO public.permissions (name, description, resource, action)
VALUES ('products:publish', 'نشر منتج', 'products', 'publish');
```

### منح الصلاحية لدور
```sql
SELECT public.grant_permission_to_role('vendor', 'products:publish');
```

---

## ⚠️ ملاحظات هامة

1. **SECURITY DEFINER:** جميع الدوال تستخدم `SECURITY DEFINER` مما يعني أنها تُنفذ بصلاحيات منشئ الدالة، وليس المستخدم الحالي.

2. **الأداء:** استخدم الفهارس المُنشأة واستخدم الدوال المُحسّنة (`owns_product` بدلاً من `owns_record`).

3. **الأدوار المؤقتة:** يمكن استخدام `expires_at` في `user_roles` للأدوار المؤقتة.

4. **التدقيق:** سجلات `granted_by` و `granted_at` توفر تتبعًا كاملاً لمن منح الدور ومتى.

---

## 📞 الدعم

لأي استفسارات أو مشاكل تقنية، يرجى التواصل مع فريق التطوير.

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
