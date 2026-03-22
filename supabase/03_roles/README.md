# Roles System

## 📋 Overview

Roles and permissions definition table for the Marketna e-commerce platform.

**Version:** 1.0
**Date:** 2026-03-21
**Dependencies:** None (Standalone file)

---

## 📁 Folder Contents

| File                  | Description                    |
| --------------------- | ------------------------------ |
| `create_table.sql`    | Create roles table and indexes |
| `create_function.sql` | Functions (none)               |
| `create_policy.sql`   | Security policies (RLS)        |
| `create_data.sql`     | Default data (4 roles)         |

---

## 📊 Table Schema

### `public.roles`

| Column        | Type        | Description                                   |
| ------------- | ----------- | --------------------------------------------- |
| `id`          | UUID        | Unique identifier for the role                |
| `name`        | role_name   | Role name (admin, vendor, delivery, customer) |
| `description` | TEXT        | Role description                              |
| `permissions` | JSONB       | Permissions array                             |
| `created_at`  | TIMESTAMPTZ | Creation timestamp                            |
| `updated_at`  | TIMESTAMPTZ | Last update timestamp                         |

---

## 🔧 Available Types

### `public.role_name` (ENUM)

| Value      | Description          |
| ---------- | -------------------- |
| `admin`    | System administrator |
| `vendor`   | Vendor/Store owner   |
| `delivery` | Delivery partner     |
| `customer` | Customer             |

---

## 📋 Default Roles

| Role       | Permissions                |
| ---------- | -------------------------- |
| `admin`    | Full system access         |
| `vendor`   | Manage products and orders |
| `delivery` | Manage deliveries          |
| `customer` | Browse and purchase        |

---

## 🔒 Security Policies

- ✅ Public read for all roles
- ✅ Only admins can manage roles

---

## 📝 Usage

```sql
-- Read all roles
SELECT * FROM public.roles;

-- Read a specific role
SELECT * FROM public.roles WHERE name = 'vendor';
```

---

## ✅ End of File
