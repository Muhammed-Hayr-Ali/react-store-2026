# 🚴 موظفي التوصيل (Delivery Partners)

## 📋 نظرة عامة

هذا المجلد يحتوي على **جدول موظفي التوصيل** (معلومات السائقين والمركبات).

**الترتيب:** 07  
**يعتمد على:** 04_roles_permissions_system, 03_profiles_schema (اختياري)  
**يسبق:** 08_delivery_partner_subscriptions

---

## 📁 محتويات الملف

| الملف | الوصف |
|-------|-------|
| `01_delivery_partners_schema.sql` | جدول موظفي التوصيل + الفهارس + الدوال + سياسات الأمان |
| `README.md` | هذا الملف |

---

## 🚀 التثبيت

```bash
# الترتيب الصحيح:

# 1. نظام الأدوار والصلاحيات
psql -f supabase/04_roles_permissions_system/01_roles_permissions_system.sql

# 2. خطط اشتراكات التوصيل
psql -f supabase/05_delivery_subscription_plans/01_delivery_subscription_plans.sql

# 3. جدول موظفي التوصيل (هذا الملف)
psql -f supabase/07_delivery_partners/01_delivery_partners_schema.sql

# 4. اشتراكات التوصيل
psql -f supabase/08_delivery_partner_subscriptions/02_delivery_partner_subscriptions.sql
```

---

## 📊 هيكل الجدول

### جدول `delivery_partners`

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | UUID | المعرف الفريد لموظف التوصيل |
| `user_id` | UUID | معرف المستخدم (FK → auth.users) |
| `profile_id` | UUID | معرف الملف الشخصي (FK → profiles) |
| `company_name` | TEXT | اسم الشركة (للمؤسسات) |
| `is_individual` | BOOLEAN | هل هو فرد؟ (TRUE = فرد، FALSE = شركة) |
| `vehicle_types` | TEXT[] | أنواع المركبات: `motorcycle`, `car`, `van`, `truck` |
| `vehicle_details` | JSONB | تفاصيل المركبات: `[{type, plate_number, model, year}]` |
| `license_number` | TEXT | رقم رخصة السير |
| `license_expiry_date` | DATE | تاريخ انتهاء الرخصة |
| `license_document_url` | TEXT | رابط وثيقة الرخصة |
| `insurance_number` | TEXT | رقم التأمين |
| `insurance_expiry_date` | DATE | تاريخ انتهاء التأمين |
| `insurance_document_url` | TEXT | رابط وثيقة التأمين |
| `coverage_areas` | JSONB | مناطق التغطية: `[{city, zones}]` |
| `max_delivery_radius` | INTEGER | أقصى نصف قطر للتوصيل (كم) |
| `phone` | TEXT | رقم الهاتف |
| `email` | TEXT | البريد الإلكتروني |
| `address` | JSONB | العنوان: `{street, city, state, postal_code, country}` |
| `account_status` | TEXT | الحالة: `pending`, `active`, `suspended`, `rejected` |
| `rejection_reason` | TEXT | سبب الرفض |
| `reviewed_by` | UUID | من راجع الطلب |
| `reviewed_at` | TIMESTAMPTZ | تاريخ المراجعة |
| `total_deliveries` | INTEGER | إجمالي عدد التوصيلات |
| `completed_deliveries` | INTEGER | عدد التوصيلات المكتملة |
| `rating` | DECIMAL(3,2) | التقييم (0.00 - 5.00) |
| `metadata` | JSONB | بيانات إضافية |

---

## 🔧 الدوال الرئيسية

| الدالة | الوصف |
|--------|-------|
| `create_delivery_partner(...)` | إنشاء سجل موظف توصيل جديد |
| `approve_delivery_partner(id)` | الموافقة على موظف توصيل (أدمن) |
| `reject_delivery_partner(id, reason)` | رفض موظف توصيل (أدمن) |
| `suspend_delivery_partner(id, reason)` | إيقاف موظف توصيل (أدمن) |
| `update_delivery_partner_info(...)` | تحديث معلومات موظف التوصيل |
| `update_delivery_partner_rating(id, rating)` | تحديث التقييم |
| `increment_delivery_stats(id, completed)` | زيادة عداد التوصيلات |

---

## 💻 أمثلة الاستخدام

### إنشاء موظف توصيل جديد:

```sql
SELECT public.create_delivery_partner(
  p_company_name := 'شركة التوصيل السريع',
  p_is_individual := FALSE,
  p_vehicle_types := ARRAY['motorcycle', 'van'],
  p_vehicle_details := '[{"type": "motorcycle", "plate_number": "أ ب ج 123", "model": 2022}]'::jsonb,
  p_license_number := 'R-123456',
  p_license_expiry_date := '2027-12-31',
  p_license_document_url := 'https://example.com/license.pdf',
  p_insurance_number := 'INS-789',
  p_insurance_expiry_date := '2026-06-30',
  p_insurance_document_url := 'https://example.com/insurance.pdf',
  p_coverage_areas := '[{"city": "الرياض", "zones": ["العليا", "الملقا"]}]'::jsonb,
  p_max_delivery_radius := 15,
  p_phone := '0501234567',
  p_email := 'driver@delivery.com',
  p_address := '{"street": "شارع التخصصي", "city": "الرياض"}'::jsonb
);
```

### الموافقة على موظف توصيل:

```sql
SELECT public.approve_delivery_partner('partner-uuid-here');
```

### تحديث معلومات موظف التوصيل:

```sql
SELECT public.update_delivery_partner_info(
  p_partner_id := 'partner-uuid-here',
  p_phone := '0559876543',
  p_coverage_areas := '[{"city": "الرياض", "zones": ["العليا", "الملقا", "النرجس"]}]'::jsonb,
  p_max_delivery_radius := 20
);
```

### تحديث التقييم:

```sql
SELECT public.update_delivery_partner_rating(
  p_partner_id := 'partner-uuid-here',
  p_rating := 4.75
);
```

### زيادة عداد التوصيلات:

```sql
SELECT public.increment_delivery_stats(
  p_partner_id := 'partner-uuid-here',
  p_completed := TRUE
);
```

---

## 🔐 سياسات الأمان (RLS)

| السياسة | النوع | الشرط |
|---------|-------|-------|
| `delivery_partners_read_own` | SELECT | موظف التوصيل يقرأ بياناته فقط |
| `delivery_partners_admin_read_all` | SELECT | الأدمن يقرأ الكل |
| `delivery_partners_insert_own` | INSERT | المستخدم ينشئ موظف توصيل خاص به |
| `delivery_partners_update_own` | UPDATE | موظف التوصيل يحدث بياناته فقط |
| `delivery_partners_admin_delete` | DELETE | الأدمن فقط يحذف |
| `delivery_partners_admin_manage` | ALL | الأدمن فقط |

---

## 📊 حالات الحساب

| الحالة | الوصف | من يغيرها |
|--------|-------|----------|
| `pending` | بانتظار المراجعة | الافتراضي عند الإنشاء |
| `active` | مفعل ونشط | Admin (approve) |
| `suspended` | موقوف مؤقتاً | Admin (suspend) |
| `rejected` | مرفوض | Admin (reject) |

---

## 📋 أنواع المركبات المتاحة

| النوع | الوصف |
|-------|-------|
| `motorcycle` | دراجة نارية |
| `car` | سيارة |
| `van` | فان |
| `truck` | شاحنة |

---

## 📋 مثال على coverage_areas (JSONB)

```json
[
  {
    "city": "الرياض",
    "zones": ["العليا", "الملقا", "النرجس", "الياسمين"]
  },
  {
    "city": "جدة",
    "zones": ["حراء", "الصفا", "المحمدية"]
  }
]
```

---

## 📋 مثال على vehicle_details (JSONB)

```json
[
  {
    "type": "motorcycle",
    "plate_number": "أ ب ج 123",
    "model": 2022,
    "year": 2022
  },
  {
    "type": "van",
    "plate_number": "د هـ و 456",
    "model": "Toyota Hiace",
    "year": 2021
  }
]
```

---

## ⚠️ ملاحظات هامة

1. **user_id فريد** - كل مستخدم يمكن أن يكون له موظف توصيل واحد فقط
2. **is_individual** - TRUE = فرد، FALSE = شركة
3. **الحالة الافتراضية** - `pending` حتى يوافق الأدمن
4. **profile_id اختياري** - يمكن أن يكون NULL
5. **vehicle_types** - مصفوفة من الأنواع: `['motorcycle', 'car']`
6. **coverage_areas** - JSONB يحتوي على المدن والمناطق

---

## 🔔 إشعارات قاعدة البيانات

### الاستماع لتغيير الحالة:

```typescript
// في تطبيق Next.js
const channel = supabase.channel('delivery_partner_status_changed')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'delivery_partners'
  }, (payload) => {
    console.log('Delivery partner status changed:', payload.new);
    // إرسال إشعار للسائق
  })
  .subscribe();
```

---

## 🔗 الملفات ذات الصلة

| الملف | الوصف |
|-------|-------|
| [04_roles_permissions_system](../04_roles_permissions_system/README.md) | نظام الأدوار |
| [05_delivery_subscription_plans](../05_delivery_subscription_plans/README.md) | خطط اشتراكات التوصيل |
| [08_delivery_partner_subscriptions](../08_delivery_partner_subscriptions/README.md) | اشتراكات التوصيل (مستقبلاً) |

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
