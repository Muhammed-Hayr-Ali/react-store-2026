# Profile Plans Links System

## 📋 Overview

User plans linking table for the Marketna e-commerce platform.

**Version:** 1.0
**Date:** 2026-03-21
**Dependencies:** `public.profiles`, `public.plans`

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

### `public.profile_plans`

| Column           | Type        | Description                  |
| ---------------- | ----------- | ---------------------------- |
| `id`             | UUID        | Unique record identifier     |
| `user_id`        | UUID        | User ID (from profiles.id)   |
| `plan_id`        | UUID        | Plan ID (from plans.id)      |
| `status`         | TEXT        | Plan status                  |
| `start_date`     | TIMESTAMPTZ | Plan start date              |
| `end_date`       | TIMESTAMPTZ | Plan end date                |
| `trial_end_date` | TIMESTAMPTZ | Trial period end date        |
| `created_at`     | TIMESTAMPTZ | Record creation timestamp    |
| `updated_at`     | TIMESTAMPTZ | Record last update timestamp |

---

## 🔧 Plan Status

| Status      | Description    |
| ----------- | -------------- |
| `active`    | Active plan    |
| `expired`   | Expired plan   |
| `cancelled` | Cancelled plan |
| `pending`   | Pending plan   |
| `trial`     | Trial period   |

---

## 🔧 Indexes

| Index                             | Description                     |
| --------------------------------- | ------------------------------- |
| `idx_profile_plans_active_unique` | Ensure one active plan per user |
| `idx_profile_plans_user`          | Fast search by user ID          |
| `idx_profile_plans_plan`          | Fast search by plan ID          |
| `idx_profile_plans_status`        | Filter plans by status          |

---

## 🔒 Security Policies

- ✅ User reads their own plan only
- ✅ User manages their own plan only

---

## 📝 Usage

```sql
-- Create a new plan
INSERT INTO public.profile_plans (user_id, plan_id, status, end_date)
VALUES ('user-uuid', 'plan-uuid', 'active', NOW() + INTERVAL '1 year');

-- Read user plans
SELECT * FROM public.profile_plans
WHERE user_id = auth.uid() AND status = 'active';
```

---

## ✅ End of File
