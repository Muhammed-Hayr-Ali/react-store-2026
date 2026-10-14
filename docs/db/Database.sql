-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.roles (
  name text NOT NULL,
  description text,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT roles_pkey PRIMARY KEY (id),
  CONSTRAINT roles_name_key UNIQUE (name)
);
CREATE TABLE public.user_roles (
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  role_id uuid NOT NULL,
  id uuid DEFAULT gen_random_uuid(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id)
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
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.password_reset_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  parent_id uuid,
  name character varying NOT NULL,
  name_ar character varying,
  slug character varying NOT NULL,
  description text,
  description_ar text,
  image_url character varying,
  image_alt character varying,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_slug_key UNIQUE (slug),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id)
);