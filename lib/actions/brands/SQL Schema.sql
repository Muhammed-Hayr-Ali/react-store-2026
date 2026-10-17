
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

-- تطبيق دالة السياسات الأمنية الديناميكية (RLS)
select public.apply_table_rls('brands', 'brand', true, false);