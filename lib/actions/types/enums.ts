/**
 * @file constants/enums.ts
 * @description المركز الوحيد لجميع القوائم (Enums) والأنواع الثابتة في النظام.
 * يُمنع تعريف أي Union Types خارج هذا الملف.
 */

// 1. حالات السجلات العامة (General Record Statuses)
export const RECORD_STATUSES = ["pending", "active", "completed", "rejected", "archived"] as const;
export type RecordStatus = (typeof RECORD_STATUSES)[number];

// 2. أنواع الكيانات (Entity Types)
export const RECORD_TYPES = ["physical", "digital", "service"] as const;
export type RecordType = (typeof RECORD_TYPES)[number];

// 3. حالات المهام (Todo Statuses) - كمثال عملي للميزة التي نعمل عليها
export const TODO_STATUSES = ["pending", "in_progress", "completed", "archived"] as const;
export type TodoStatus = (typeof TODO_STATUSES)[number];

// 4. أولويات المهام (Todo Priorities)
export const TODO_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TodoPriority = (typeof TODO_PRIORITIES)[number];