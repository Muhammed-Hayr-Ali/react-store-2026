-- ============================================================================
-- 1. دالة تنظيف شاملة - تمسح كل شيء
-- ============================================================================

create or replace function public.cleanup_profiles_system()
returns void
language plpgsql
as $$
begin
  -- حذف الـ Triggers
  drop trigger if exists on_profile_updated on public.profiles;
  drop trigger if exists on_auth_user_created on auth.users;
  
  -- حذف الدوال
  drop function if exists public.handle_updated_at();
  drop function if exists public.handle_new_user();
  drop function if exists public.get_public_profiles();
  drop function if exists public.get_public_profile_by_id(uuid);
  
  -- حذف الجدول (مع CASCADE لحذف السياسات تلقائياً)
  drop table if exists public.profiles cascade;
end;
$$;

-- تنفيذ دالة التنظيف
select public.cleanup_profiles_system();

-- ============================================================================
-- 2. إنشاء جدول البروفايل مع حقل البريد الإلكتروني
-- ============================================================================

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text,
  last_name text,
  email text unique,
  phone_number text unique,
  profile_image text,
  gender text check (gender in ('male', 'female', 'other')),
  phone_verified_at timestamptz,
  email_verified_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- 3. دالة تحديث updated_at تلقائياً
-- ============================================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ============================================================================
-- 4. دالة إنشاء البروفايل تلقائياً عند تسجيل مستخدم جديد
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    first_name,
    last_name,
    email,
    phone_number,
    gender,
    profile_image
  )
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'last_name',
    new.email,
    new.phone,
    new.raw_user_meta_data->>'gender',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- 5. تفعيل الأمان على الجدول الأصلي
-- ============================================================================

alter table public.profiles enable row level security;

-- ============================================================================
-- 6. سياسات الأمان للجدول الأصلي (profiles)
-- ============================================================================

create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

create policy "Users can delete own profile"
  on public.profiles for delete
  using ( auth.uid() = id );

-- ============================================================================
-- 7. دوال لإرجاع البروفايل العام (للعرض في التعليقات)
-- ============================================================================

create or replace function public.get_public_profiles()
returns table (
  id uuid,
  first_name text,
  profile_image text
) 
language sql 
security definer
set search_path = public
as $$
  select id, first_name, profile_image 
  from public.profiles;
$$;

create or replace function public.get_public_profile_by_id(p_user_id uuid)
returns table (
  id uuid,
  first_name text,
  profile_image text
) 
language sql 
security definer
set search_path = public
as $$
  select id, first_name, profile_image 
  from public.profiles 
  where id = p_user_id;
$$;

-- ============================================================================
-- 8. منح الصلاحيات
-- ============================================================================

grant select, insert, update, delete on public.profiles to authenticated;
grant execute on function public.get_public_profiles() to anon, authenticated;
grant execute on function public.get_public_profile_by_id(uuid) to anon, authenticated;

-- ============================================================================
-- تم إنشاء النظام بالكامل بنجاح!
-- ============================================================================