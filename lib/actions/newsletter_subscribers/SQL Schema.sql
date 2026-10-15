create table public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  status text default 'active' check (status in ('active', 'unsubscribed')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unsubscribe_reason text
);

-- تطبيق دالة السياسات الأمنية الديناميكية (الجدول عام للإدخال، خاص ومقيد للإدارة)
select public.apply_table_rls('newsletter_subscribers', 'newsletter_subscriber', true, false);