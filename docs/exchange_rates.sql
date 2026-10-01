create table if not exists public.exchange_rates (
  currency_code text primary key,
  rate_from_usd numeric not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);





-- 1. تفعيل نظام حماية الصفوف على الجدول
alter table public.exchange_rates enable row level security;

-- 2. إعطاء صلاحية القراءة للجميع (الزوار والمستخدمين المسجلين)
create policy "Allow public read access to exchange rates"
on public.exchange_rates
for select
to public
using (true);

-- 3. حصر التعديل والإضافة والحذف بدور الـ service_role فقط (الخلفية / Cron Job)
create policy "Allow service_role full access to exchange rates"
on public.exchange_rates
for all
to service_role
using (true)
with check (true);