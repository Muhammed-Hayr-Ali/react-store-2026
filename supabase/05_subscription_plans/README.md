# Subscription Plans System

## 📋 Overview

Subscription plans definition table for the Marketna e-commerce platform.

**Version:** 1.0
**Date:** 2026-03-21
**Dependencies:** None (Standalone file)

---

## 📁 Folder Contents

| File                  | Description                    |
| --------------------- | ------------------------------ |
| `create_table.sql`    | Create plans table and indexes |
| `create_function.sql` | Functions (none)               |
| `create_policy.sql`   | Security policies (RLS)        |
| `create_data.sql`     | Default data (8 plans)         |

---

## 📊 Table Schema

### `public.plans`

| Column           | Type          | Description                                |
| ---------------- | ------------- | ------------------------------------------ |
| `id`             | UUID          | Unique identifier for the plan             |
| `category`       | plan_category | Plan category (seller, delivery, customer) |
| `name`           | TEXT          | Plan name                                  |
| `price`          | NUMERIC       | Plan price                                 |
| `billing_period` | TEXT          | Billing period                             |
| `permissions`    | JSONB         | Plan permissions                           |
| `is_default`     | BOOLEAN       | Whether this plan is default               |
| `is_popular`     | BOOLEAN       | Whether this plan is popular               |

---

## 🔧 Available Types

### `plan_category` (ENUM)

| Value      | Description      |
| ---------- | ---------------- |
| `seller`   | Seller/Store     |
| `delivery` | Delivery Partner |
| `customer` | Customer         |

---

## 📋 Default Plans

### Seller Plans (4 plans)

| Plan                | Price  | Period   |
| ------------------- | ------ | -------- |
| Free Seller         | $0     | lifetime |
| Starter Seller      | $29.99 | yearly   |
| Professional Seller | $59.99 | yearly   |
| Enterprise Seller   | $99.99 | yearly   |

### Delivery Plans (3 plans)

| Plan                          | Price  | Period   |
| ----------------------------- | ------ | -------- |
| Free Delivery Partner         | $0     | lifetime |
| Starter Delivery Partner      | $29.99 | yearly   |
| Professional Delivery Partner | $49.99 | yearly   |

### Customer Plans (1 plan)

| Plan        | Price | Period   |
| ----------- | ----- | -------- |
| Free Member | $0    | lifetime |

---

## 🔒 Security Policies

- ✅ Public read for all plans
- ✅ Admins manage all plans

---

## 📝 Usage

```sql
-- Read all plans
SELECT * FROM public.plans ORDER BY category, price;

-- Read plans for a specific category
SELECT * FROM public.plans WHERE category = 'seller';
```

---

## ✅ End of File
