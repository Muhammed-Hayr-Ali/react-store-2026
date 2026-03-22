# Profile Roles Links System

## 📋 Overview

User roles linking table for the Marketna e-commerce platform.

**Version:** 1.0
**Date:** 2026-03-21
**Dependencies:** `public.profiles`, `public.roles`

---

## 📁 Folder Contents

| File                  | Description                   |
| --------------------- | ----------------------------- |
| `create_table.sql`    | Create link table and indexes |
| `create_function.sql` | Functions (none)              |
| `create_policy.sql`   | Security policies (RLS)       |
| `create_data.sql`     | Default data (none)           |

---

## 📊 Table Schema

### `public.profile_roles`

| Column       | Type        | Description                      |
| ------------ | ----------- | -------------------------------- |
| `user_id`    | UUID        | User ID (from profiles.id)       |
| `role_id`    | UUID        | Role ID (from roles.id)          |
| `is_active`  | BOOLEAN     | Whether role is currently active |
| `granted_at` | TIMESTAMPTZ | Role grant timestamp             |
| `granted_by` | UUID        | Who granted the role             |

**Primary Key:** `(user_id, role_id)`

---

## 🔧 Indexes

| Index                      | Description            |
| -------------------------- | ---------------------- |
| `idx_profile_roles_user`   | Fast search by user ID |
| `idx_profile_roles_role`   | Fast search by role ID |
| `idx_profile_roles_active` | Filter active roles    |

---

## 🔒 Security Policies

- ✅ User reads their own active roles only
- ✅ Admins read all roles
- ✅ Only admins can manage roles

---

## 📝 Usage

```sql
-- Grant a role to a user
INSERT INTO public.profile_roles (user_id, role_id, is_active)
VALUES ('user-uuid', 'role-uuid', true);

-- Read user roles
SELECT r.name, r.description
FROM public.profile_roles pr
JOIN public.roles r ON r.id = pr.role_id
WHERE pr.user_id = auth.uid() AND pr.is_active = true;
```

---

## ✅ End of File
