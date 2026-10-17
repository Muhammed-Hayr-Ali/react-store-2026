# 🏷️ توثيق جدول العلامات التجارية (Brands Table Documentation)

يوثق هذا المستند الهيكل المعماري لجدول العلامات التجارية (`brands`) في قاعدة البيانات، متوافقاً تماماً مع **القاموس الموحد لأسماء الأعمدة (Unified Database Column Dictionary)** وسياسات الحماية الأمنية.

---

## 🏗️ هيكل الجدول (SQL Schema)

```sql
create table public.brands (
  id uuid default gen_random_uuid() primary key,
  name varchar not null,
  name_ar varchar null,
  slug varchar not null constraint brands_slug_key unique,
  description text null,
  description_ar text null,
  image_url varchar null,
  image_alt varchar null,
  is_active boolean default true not null,
  sort_order integer default 0 not null,
  meta_title varchar null,
  meta_description varchar null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- تطبيق دالة السياسات الأمنية والديناميكية (RLS)
select public.apply_table_rls('brands', 'brand', true, false);



📋 تفصيل الأعمدة والخصائص
المعرفات والروابط (Identifiers & Slugs):

id: المعرف الأساسي للكيان بنوع UUID ويتم توليده تلقائياً.

name / name_ar: اسم العلامة التجارية باللغة الإنجليزية (أو الأساسية) والعربية.

slug: معرف نصي فريد ومستقر للروابط العامة وتحسين محركات البحث، مع قيد تفرد صريح باسم brands_slug_key.

الوسائط والوصف (Media & Localization):

description / description_ar: الوصف الشامل أو النبذة التعريفية باللغتين.

image_url: رابط شعار أو صورة العلامة التجارية.

image_alt: النص البديل للصورة لدواعي الـ SEO والوصول.

التحكم والترتيب (Status & Sorting):

is_active: مؤشر حالة التفعيل في النظام (قيمة افتراضية true).

sort_order: رقم لتحديد الترتيب اليدوي لعرض العلامات التجارية (قيمة افتراضية 0).

تحسين محركات البحث والتواريخ (SEO & Timestamps):

meta_title / meta_description: العنوان والوصف الخاص بمحركات البحث لصفحة العلامة التجارية.

created_at / updated_at: الطوابع الزمنية لإنشاء وتحديث السجل تلقائياً بنوع TIMESTAMPTZ.

🔒 السياسات الأمنية وحماية البيانات (RLS)
الوصول العام: تم تفعيل القراءة العامة للجدول (Public Read) لتسهيل عرض العلامات التجارية للزوار في واجهة المتجر.

الحماية الإدارية: عمليات الإضافة، التعديل، والحذف محمية ومقيدة بالصلاحيات الإدارية عبر دالة الأمان الديناميكية (apply_table_rls).