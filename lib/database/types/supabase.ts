// =====================================================
// 🔧 Supabase Type Helpers
// =====================================================
// ⚠️ أنواع مساعدة للتعامل مع Supabase RPC و Queries
// =====================================================

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database/types"

// =====================================================
// 📋 RPC Function Types
// =====================================================

export type RpcFunctions = Database["public"]["Functions"]

export type RpcFunctionArgs<T extends keyof RpcFunctions> =
  RpcFunctions[T]["Args"]

export type RpcFunctionReturn<T extends keyof RpcFunctions> =
  RpcFunctions[T]["Returns"]

// =====================================================
// 🛠️ Typed Supabase Client Type
// =====================================================

export type TypedSupabaseClient = SupabaseClient<Database>

// =====================================================
// 📊 Query Result Types
// =====================================================

export type QueryResult<T> = {
  data: T | null
  error: Error | null
}

export type QueryManyResult<T> = {
  data: T[] | null
  error: Error | null
}
