-- إنشاء جدول رموز استعادة كلمة المرور
create table public.password_reset_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  token text unique not null,
  expires_at timestamptz not null,
  used boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- تفعيل الأمان
alter table public.password_reset_tokens enable row level security;

-- سياسة: لا أحد يستطيع قراءة هذا الجدول مباشرة (للأمان)
create policy "No direct access to reset tokens"
  on public.password_reset_tokens for all
  using (false);

-- دالة آمنة للتحقق من الرمز واستخدامه (Security Definer)
create or replace function public.verify_and_use_reset_token(p_token text)
returns uuid -- يرجع user_id إذا كان الرمز صحيحاً
language plpgsql security definer
as $$
declare
  v_user_id uuid;
begin
  -- البحث عن الرمز غير المستخدم ولم تنتهِ صلاحيته
  select user_id into v_user_id
  from public.password_reset_tokens
  where token = p_token 
    and used = false 
    and expires_at > now();

  if v_user_id is null then
    raise exception 'Invalid or expired token';
  end if;

  -- تحديث حالة الرمز إلى "مستخدم"
  update public.password_reset_tokens
  set used = true
  where token = p_token;

  return v_user_id;
end;
$$;