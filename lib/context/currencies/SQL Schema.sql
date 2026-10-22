create table public.currencies (
  code text primary key,            -- مثل: USD, EUR, SAR, SYP
  name text not null,               -- اسم العملة بالإنجليزية
  name_ar text not null,            -- اسم العملة بالعربية
  symbol text not null,             -- الرمز مثل: $, €, ر.س, ل.س
  rate_factor bigint not null,      -- سعر الصرف مضروباً في 10,000 (لحفظه كرقم صحيح بدقة عالية)
  is_active boolean default true,   -- هل العملة مفعلة في المتجر؟
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);



-- 1. تفعيل حماية الأمان على الجدول
alter table public.currencies enable row level security;

-- 2. السماح للجميع (زوار ومستخدمين) بقراءة العملات فقط
create policy "Allow public read access on currencies"
  on public.currencies
  for select
  using (true);