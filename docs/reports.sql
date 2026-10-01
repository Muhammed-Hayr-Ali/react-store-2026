-- 1. أنواع البلاغات وحالاتها
create type public.report_target_type as enum ('product', 'review', 'technical_issue', 'general');
create type public.report_status as enum ('pending', 'under_review', 'resolved', 'dismissed');

-- 2. إنشاء جدول البلاغات
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete set null,
  target_type public.report_target_type not null,
  target_id text, -- معرف العنصر المبلغ عنه (id المنتج أو التعليق)، يمكن تركه فارغاً للبلاغات العامة
  reason text not null, -- سبب البلاغ (مثل: محتوى غير لائق، منتج زائف، خلل فني)
  details text, -- شرح تفصيلي اختياري من المستخدم
  contact_email text, -- في حال كان المبلغ زائر غير مسجل أو للمتابعة
  status public.report_status default 'pending' not null,
  admin_notes text, -- ملاحظات المشرف عند المعالجة
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. تفعيل RLS
alter table public.reports enable row level security;

-- صلاحية الإرسال (INSERT): مسموح لأي مستخدم مسجل الدخول (أو anon إذا أردت السماح للزوار)
create policy "Allow authenticated users to create reports"
on public.reports
for insert
to authenticated
with check (true);

-- صلاحية القراءة (SELECT): المستخدم يرى بلاغاته فقط
create policy "Users can view their own reports"
on public.reports
for select
to authenticated
using (auth.uid() = reporter_id);

-- صلاحية المشرفين (Admin / Service Role): إدارة وعرض كافة البلاغات
create policy "Allow service_role full access to reports"
on public.reports
for all
to service_role
using (true)
with check (true);










5. أمثلة الاستخدام في التطبيق
للإبلاغ عن منتج (داخل صفحة المنتج):
TypeScript
<ReportDialog targetType="product" targetId={product.id} title="Report Product" />
للإبلاغ عن تعليق (داخل مكون التعليقات):
TypeScript
<ReportDialog targetType="review" targetId={review.id} title="Report Review" />
للإبلاغ عن خلل فني عام (في الفوتر أو قائمة المساعدة):
TypeScript
<ReportDialog targetType="technical_issue" title="Report a Bug">
  <button className="text-xs text-muted-foreground hover:underline">
    Report an Issue
  </button>
</ReportDialog>
هل تفضل أن نبدأ بإعداد واجهة لوحة تحكم المشرف (Admin Dashboard) لمراجعة هذه البلاغات وتغيير حالتها، أم ندمج زر البلاغ أولاً داخل صفحة تفاصيل المنتج؟