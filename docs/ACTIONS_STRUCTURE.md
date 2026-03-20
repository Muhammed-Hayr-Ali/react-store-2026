# 📚 هيكلية الدوال - Marketna Actions

## 🎯 نظرة عامة

تم نقل جميع الدوال من المكونات إلى مجلد `lib/actions` مع تنظيمها حسب الوظيفة.

---

## 📁 هيكل المجلدات

```
lib/actions/
├── authentication/        ← دوال المصادقة
│   ├── signInWithPassword.ts
│   ├── signUpWithPassword.ts
│   ├── signIn-with-google.ts
│   └── ...
├── sellers/              ← دوال الباعة
│   └── createSeller.ts
├── delivery/             ← دوال التوصيل
│   └── createDeliveryPartner.ts
├── subscriptions/        ← دوال الاشتراكات
│   └── createUpgradeRequest.ts
└── admin/                ← دوال الإدارة
    └── upgradeRequests.ts
```

---

## 🔧 دوال الباعة (Sellers)

### **ملف:** `lib/actions/sellers/createSeller.ts`

```typescript
export interface CreateSellerInput {
  store_name: string
  store_description?: string
  phone: string
  email: string
  tax_number?: string
  commercial_registration?: string
  street?: string
  city: string
  country?: string
}

export async function createSeller(
  input: CreateSellerInput
): Promise<ApiResult & { sellerId?: string }>
```

**الاستخدام:**

```typescript
import { createSeller } from "@/lib/actions/sellers/createSeller"

const result = await createSeller({
  store_name: "My Store",
  phone: "0501234567",
  email: "store@example.com",
  city: "Riyadh",
})

if (result.success) {
  console.log("Seller created:", result.sellerId)
}
```

---

## 🚚 دوال التوصيل (Delivery)

### **ملف:** `lib/actions/delivery/createDeliveryPartner.ts`

```typescript
export interface CreateDeliveryPartnerInput {
  company_name: string
  phone: string
  email: string
  license_number?: string
  insurance_number?: string
  vehicle_types: string
  coverage_areas?: string
  max_delivery_radius?: number
}

export async function createDeliveryPartner(
  input: CreateDeliveryPartnerInput
): Promise<ApiResult & { partnerId?: string }>
```

**الاستخدام:**

```typescript
import { createDeliveryPartner } from "@/lib/actions/delivery/createDeliveryPartner"

const result = await createDeliveryPartner({
  company_name: "Fast Delivery",
  phone: "0501234567",
  email: "driver@example.com",
  vehicle_types: "motorcycle",
})

if (result.success) {
  console.log("Delivery partner created:", result.partnerId)
}
```

---

## 💳 دوال الاشتراكات (Subscriptions)

### **ملف:** `lib/actions/subscriptions/createUpgradeRequest.ts`

```typescript
export interface CreateUpgradeRequestInput {
  sellerId: string
  planId: string
  contactMethod?: string
  contactValue?: string
  notes?: string
}

export async function createUpgradeRequest(
  input: CreateUpgradeRequestInput
): Promise<ApiResult>

export async function createDeliveryUpgradeRequest(
  input: CreateUpgradeRequestInput
): Promise<ApiResult>

export async function getSellerUpgradeRequests(
  sellerId: string
): Promise<any[]>

export async function getDeliveryUpgradeRequests(
  partnerId: string
): Promise<any[]>
```

**الاستخدام:**

```typescript
import { createUpgradeRequest } from "@/lib/actions/subscriptions/createUpgradeRequest"

const result = await createUpgradeRequest({
  sellerId: "seller-uuid",
  planId: "plan-uuid",
  contactMethod: "email",
  contactValue: "store@example.com",
})

if (result.success) {
  console.log("Upgrade request created")
}
```

---

## 👨‍💼 دوال الإدارة (Admin)

### **ملف:** `lib/actions/admin/upgradeRequests.ts`

```typescript
export interface ApproveUpgradeRequestInput {
  requestId: string
  adminNotes?: string
}

export interface RejectUpgradeRequestInput {
  requestId: string
  adminNotes: string
}

export async function approveUpgradeRequest(
  input: ApproveUpgradeRequestInput
): Promise<ApiResult>

export async function rejectUpgradeRequest(
  input: RejectUpgradeRequestInput
): Promise<ApiResult>

export async function completeUpgradeRequest(
  requestId: string
): Promise<ApiResult>

export async function getAllUpgradeRequests(
  statusFilter?: string
): Promise<any[]>
```

**الاستخدام:**

```typescript
import {
  approveUpgradeRequest,
  rejectUpgradeRequest,
  completeUpgradeRequest,
  getAllUpgradeRequests,
} from "@/lib/actions/admin/upgradeRequests"

// Get all requests
const requests = await getAllUpgradeRequests("pending")

// Approve request
const result = await approveUpgradeRequest({
  requestId: "request-uuid",
  adminNotes: "Approved",
})

// Complete request
await completeUpgradeRequest("request-uuid")
```

---

## 📝 نمط كتابة الدوال

### **الهيكل الأساسي:**

```typescript
import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import { ApiResult } from "@/lib/types/common"

export interface MyFunctionInput {
  param1: string
  param2?: number
}

// ===============================================================================
// Function Name
// ===============================================================================
export async function myFunction({
  param1,
  param2,
}: MyFunctionInput): Promise<ApiResult & { data?: any }> {
  const supabase = createBrowserClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: "USER_NOT_AUTHENTICATED",
    }
  }

  // Your logic here
  const { data, error } = await supabase
    .from("table")
    .insert({ ... })
    .select()
    .single()

  if (error) {
    console.error("Error:", error)
    return {
      success: false,
      error: "OPERATION_ERROR",
    }
  }

  return {
    success: true,
    data: data,
  }
}
```

---

## ✅ فوائد هذا النمط

### **1. فصل المسؤوليات:**
- ✅ المكونات للواجهة فقط
- ✅ الدوال في lib/actions
- ✅ سهولة الصيانة

### **2. إعادة الاستخدام:**
- ✅ نفس الدالة تستخدم في أماكن متعددة
- ✅ تقليل التكرار
- ✅ كود أنظف

### **3. الاختبار:**
- ✅ سهولة اختبار الدوال
- ✅ Mocking أسهل
- ✅ اختبار الوحدة

### **4. الأنواع (Types):**
- ✅ Typescript قوي
- ✅ autocomplete
- ✅ اكتشاف الأخطاء مبكراً

### **5. معالجة الأخطاء:**
- ✅ أخطاء موحدة
- ✅ رسائل واضحة
- ✅ تتبع أفضل

---

## 🎯 أمثلة الاستخدام

### **في المكونات:**

```typescript
"use client"

import { useState } from "react"
import { createSeller } from "@/lib/actions/sellers/createSeller"

export default function SellerForm() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: FormData) => {
    setLoading(true)

    const result = await createSeller({
      store_name: data.get("store_name") as string,
      phone: data.get("phone") as string,
      email: data.get("email") as string,
      city: data.get("city") as string,
    })

    if (result.success) {
      // Success
      router.push("/success")
    } else {
      // Error handling
      if (result.error === "USER_NOT_AUTHENTICATED") {
        router.push("/signin")
      }
    }

    setLoading(false)
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## 📊 مقارنة: قبل وبعد

### **قبل (في المكونات):**

```typescript
// ❌ في المكون
const handleSubmit = async () => {
  const supabase = createBrowserClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  const { data, error } = await supabase
    .from("sellers")
    .insert({ ... })
    .select()
    .single()
  
  if (error) {
    alert("Error")
    return
  }
  
  router.push("/success")
}
```

### **بعد (في lib/actions):**

```typescript
// ✅ في lib/actions
export async function createSeller(input: CreateSellerInput) {
  const supabase = createBrowserClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "USER_NOT_AUTHENTICATED" }
  }
  
  // Logic...
  
  return { success: true, sellerId: seller.id }
}

// في المكون
const result = await createSeller(input)
if (result.success) {
  router.push("/success")
}
```

---

**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
