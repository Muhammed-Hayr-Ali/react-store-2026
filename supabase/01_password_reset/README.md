# Password Reset Tokens System

## 📋 Overview

Secure password reset token management system for the Marketna e-commerce platform.

**Version:** 1.0
**Date:** 2026-03-21
**Dependencies:** None (Standalone file)

---

## 📁 Folder Contents

| File                  | Description                                    |
| --------------------- | ---------------------------------------------- |
| `create_table.sql`    | Create password reset tokens table and indexes |
| `create_function.sql` | Token creation and verification functions      |
| `create_policy.sql`   | Security policies (RLS)                        |
| `create_data.sql`     | Default data (none)                            |

---

## 📊 Table Schema

### `public.password_reset_tokens`

| Column       | Type        | Description                  |
| ------------ | ----------- | ---------------------------- |
| `id`         | UUID        | Unique token identifier      |
| `user_id`    | UUID        | User ID                      |
| `email`      | TEXT        | Email address                |
| `token`      | TEXT        | Secret token (64 characters) |
| `expires_at` | TIMESTAMPTZ | Expiration time              |
| `used_at`    | TIMESTAMPTZ | Usage timestamp              |
| `ip_address` | INET        | IP address for audit         |
| `created_at` | TIMESTAMPTZ | Creation timestamp           |

---

## 🔧 Available Functions

| Function                         | Description                         |
| -------------------------------- | ----------------------------------- |
| `create_password_reset_token()`  | Create a new token                  |
| `claim_password_reset_token()`   | Atomic verification and consumption |
| `verify_password_reset_token()`  | Verify only (for display)           |
| `cleanup_expired_reset_tokens()` | Clean up old tokens                 |

---

## 🔒 Security Policies

- ✅ Completely prevent public read
- ✅ Backend service full access only

---

## 📝 Usage

```sql
-- Create a token
SELECT create_password_reset_token('user-uuid', 'user@example.com', 60);

-- Verify and claim token
SELECT * FROM claim_password_reset_token('token-here');
```

---

## ✅ End of File
