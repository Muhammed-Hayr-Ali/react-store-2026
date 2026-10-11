/**
 * @file lib\actions\types\enums.ts
 * 
 * @description المركز الوحيد للأنواع الثابتة والقوائم (Single Source of Truth for Enums & Union Types).
 * 
 * 🎯 القاعدة المعمارية (Architectural Rule #4):
 * - يُمنع منعاً باتاً تعريف أي مصفوفات ثوابت (Constant Arrays) أو Union Types داخل ملفات Zod Schemas أو الـ Types المستقلة.
 * - أي قائمة خيارات (Status, Priority, Type) يجب أن تُعرّف هنا أولاً، ثم تُصدّر وتُستخدم في باقي أجزاء النظام.
 * - الهدف: ضمان التطابق بنسبة 100% بين واجهات المستخدم (UI Select/Dropdowns)، ومخططات التحقق (Zod)، وقاعدة البيانات.
 */

// ==========================================
// 1. ثوابت النظام العامة (General System Constants)
// ==========================================

/**
 * @constant RECORD_STATUSES
 * @description الحالات القياسية لأي سجل في النظام يدعم دورة حياة أساسية.
 */
export const RECORD_STATUSES = ["pending", "active", "completed", "rejected", "archived"] as const;

/**
 * @type RecordStatus
 * @description النوع المشتق من مصفوفة حالات السجلات لاستخدامه في TypeScript Interfaces.
 */
export type RecordStatus = (typeof RECORD_STATUSES)[number];

/**
 * @constant RECORD_TYPES
 * @description تصنيفات الكيانات الأساسية داخل النظام (ملموس، رقمي، خدمة).
 */
export const RECORD_TYPES = ["physical", "digital", "service"] as const;

/**
 * @type RecordType
 * @description النوع المشتق من مصفوفة أنواع السجلات.
 */
export type RecordType = (typeof RECORD_TYPES)[number];


// ==========================================
// 2. ثوابت ميزة المهام (Todo Feature Constants)
// ==========================================

/**
 * @constant TODO_STATUSES
 * @description الحالات الخاصة بدورة حياة المهام (Todos).
 * @usage تُستخدم في: Zod Enum, TodoRecord Interface, UI Filter Dropdowns.
 */
export const TODO_STATUSES = ["pending", "in_progress", "completed", "archived"] as const;

/**
 * @type TodoStatus
 * @description نوع TypeScript المشتق لحالة المهمة.
 */
export type TodoStatus = (typeof TODO_STATUSES)[number];

/**
 * @constant TODO_PRIORITIES
 * @description مستويات الأولوية الخاصة بالمهام.
 */
export const TODO_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

/**
 * @type TodoPriority
 * @description نوع TypeScript المشتق لأولوية المهمة.
 */
export type TodoPriority = (typeof TODO_PRIORITIES)[number];

// 💡 ملاحظة للمطورين: عند إضافة ميزة جديدة (مثال: الطلبات Orders)، 
// قم بإضافة المصفوفة الخاصة بها هنا (مثال: ORDER_STATUSES) ثم استدعها في Zod Schema الخاص بها.