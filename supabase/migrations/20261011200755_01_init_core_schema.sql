-- 1. Tables
CREATE TABLE public.roles (
  name text NOT NULL UNIQUE,
  description text,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);

CREATE TABLE public.user_roles (
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  role_id uuid NOT NULL,
  id uuid DEFAULT gen_random_uuid(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE
);

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  first_name text,
  last_name text,
  email text UNIQUE,
  phone_number text UNIQUE,
  profile_image text,
  gender text CHECK (gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text])),
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'suspended'::text, 'banned'::text])),
  ban_reason text,
  banned_at timestamp with time zone,
  phone_verified_at timestamp with time zone,
  email_verified_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE public.password_reset_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. RLS Policies
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- 3. Functions & Triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_profile_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_role_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  role_name text;
  role_perms jsonb;
BEGIN
  SELECT name, permissions INTO role_name, role_perms FROM public.roles WHERE id = NEW.role_id;
  UPDATE auth.users SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', role_name, 'permissions', coalesce(role_perms, '[]'::jsonb)) WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_role_change AFTER INSERT OR UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.handle_role_change();