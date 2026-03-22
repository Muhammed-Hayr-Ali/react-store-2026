# Profiles System

## 📋 Overview

User profile management table for the Marketna e-commerce platform.

**Version:** 1.0
**Date:** 2026-03-21
**Dependencies:** None (Standalone file)

---

## 📁 Folder Contents

| File                  | Description                           |
| --------------------- | ------------------------------------- |
| `create_table.sql`    | Create profiles table and indexes     |
| `create_function.sql` | Profile creation and update functions |
| `create_policy.sql`   | Security policies (RLS)               |
| `create_data.sql`     | Default data (none)                   |

---

## 📊 Table Schema

### `public.profiles`

| Column            | Type        | Description                         |
| ----------------- | ----------- | ----------------------------------- |
| `id`              | UUID        | Unique identifier (from auth.users) |
| `email`           | TEXT        | Email address                       |
| `provider`        | TEXT        | Authentication provider             |
| `first_name`      | TEXT        | First name                          |
| `last_name`       | TEXT        | Last name                           |
| `full_name`       | TEXT        | Full name (computed)                |
| `phone`           | TEXT        | Phone number                        |
| `phone_verified`  | BOOLEAN     | Phone verified status               |
| `avatar_url`      | TEXT        | Profile picture URL                 |
| `bio`             | TEXT        | Biography                           |
| `email_verified`  | BOOLEAN     | Email verified status               |
| `created_at`      | TIMESTAMPTZ | Creation timestamp                  |
| `updated_at`      | TIMESTAMPTZ | Last update timestamp               |
| `last_sign_in_at` | TIMESTAMPTZ | Last sign-in timestamp              |

---

## 🔧 Available Functions

| Function              | Description              |
| --------------------- | ------------------------ |
| `handle_new_user()`   | Create profile on signup |
| `handle_user_login()` | Update last sign-in time |

---

## 🔒 Security Policies

- ✅ User reads their own full profile
- ✅ User updates their own profile only
- ✅ Public information readable for other users

---

## 📝 Usage

```sql
-- Read current profile
SELECT * FROM public.profiles WHERE id = auth.uid();

-- Update profile
UPDATE public.profiles SET first_name = 'John' WHERE id = auth.uid();
```

---

## ✅ End of File
